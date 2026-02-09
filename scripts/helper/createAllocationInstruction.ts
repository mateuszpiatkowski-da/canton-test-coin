#!/usr/bin/env bun

import sdk from 'src/util/walletSDK';
import { type WrappedCommand } from '@canton-network/wallet-sdk';
import admin from 'src/util/admin';
import { type components as ledgerClientComponents } from '@canton-network/core-ledger-client';
import allocationService from 'src/api/allocation-instruction/service';
import helperInitializer from './util/helperInitializer';
import { randomUUIDv7 } from 'bun';
import { createLogger } from 'src/util/logger';
import {
  AllocationFactory,
  AllocationFactory_Allocate,
} from '@daml-ts/splice-api-token-1.0.0/lib/Splice/Api/Token/AllocationInstructionV1';
import emptyMeta from './util/emptyMeta';
import emptyExtraArgs from './util/emptyExtraArgs';
import { CoinAllocationInstruction } from '@daml-ts/test-coin-1.0.0/lib/Coin/Allocation/Instruction/module';

const logger = createLogger({ name: 'createAllocationInstruction' });

const createAllocationInstruction = async () => {
  await helperInitializer.init();

  const { sender, receiver, tokenCid } = helperInitializer.data;

  await allocationService.addSenders([sender.partyId]);
  const factoryID = await allocationService.getFactoryCID();

  const allocationFactoryAllocateCommand: WrappedCommand<'ExerciseCommand'> = {
    ExerciseCommand: {
      templateId: AllocationFactory.templateId,
      contractId: factoryID,
      choice: 'AllocationFactory_Allocate',
      choiceArgument: {
        expectedAdmin: admin.partyId,
        allocation: {
          settlement: {
            executor: admin.partyId, // no point in creating another party,
            settlementRef: {
              id: randomUUIDv7(),
              cid: null,
            },
            requestedAt: helperInitializer.requestedAt.toISOString(),
            allocateBefore: helperInitializer.executeBefore.toISOString(),
            settleBefore: helperInitializer.executeBefore.toISOString(), // no point in creating another deadline (even though time should be strictly after `allocateBefore`)
            meta: emptyMeta,
          },
          transferLegId: `${sender.partyId}__${receiver.partyId}`,
          transferLeg: {
            sender: sender.partyId,
            receiver: receiver.partyId,
            amount: '100.0',
            instrumentId: {
              admin: admin.partyId,
              id: randomUUIDv7(),
            },
            meta: emptyMeta,
          },
        },
        requestedAt: helperInitializer.requestedAt.toISOString(),
        inputHoldingCids: [tokenCid],
        extraArgs: emptyExtraArgs,
      } satisfies AllocationFactory_Allocate,
    },
  };

  await sdk.userLedger?.setPartyId(sender.partyId);

  const signCompletionResult = await sdk.userLedger?.prepareSignExecuteAndWaitFor(
    allocationFactoryAllocateCommand,
    [
      {
        partyId: admin.partyId,
        privateKey: admin.keyPair.privateKey,
      },
      {
        partyId: sender.partyId,
        privateKey: sender.keyPair.privateKey,
      },
    ],
    randomUUIDv7(),
  );

  const result = await sdk.userLedger?.getEventsByUpdateId(signCompletionResult!.updateId);

  const allocationInstructionEvent = result?.find(
    (event) =>
      'CreatedEvent' in event && event.CreatedEvent.templateId === CoinAllocationInstruction.templateIdWithPackageId,
  ) as { CreatedEvent: ledgerClientComponents['schemas']['CreatedEvent'] };

  logger.info({ allocationInstructionCid: allocationInstructionEvent.CreatedEvent.contractId });

  return allocationInstructionEvent.CreatedEvent.contractId;
};

export default createAllocationInstruction;

if (import.meta.main) {
  await createAllocationInstruction();
}
