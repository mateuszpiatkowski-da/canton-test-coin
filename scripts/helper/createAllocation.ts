#!/usr/bin/env bun

import sdk from 'src/util/walletSDK';
import { type WrappedCommand } from '@canton-network/wallet-sdk';
import admin from 'src/util/admin';
import { type components as ledgerClientComponents } from '@canton-network/core-ledger-client';
import helperInitializer from './util/helperInitializer';
import { randomUUIDv7 } from 'bun';
import { createLogger } from 'src/util/logger';
import emptyExtraArgs from './util/emptyExtraArgs';
import createAllocationInstruction from './createAllocationInstruction';
import {
  AllocationInstruction,
  AllocationInstruction_Update,
} from '@daml-ts/splice-api-token-1.0.0/lib/Splice/Api/Token/AllocationInstructionV1/module';
import { CoinAllocation } from '@daml-ts/test-coin-1.0.0/lib/Coin/Allocation/Allocation/module';

const logger = createLogger({ name: 'createAllocation' });

const createAllocation = async () => {
  await helperInitializer.init();

  const { sender } = helperInitializer.data;

  const allocationInstructionCid = await createAllocationInstruction();

  const allocationCreateCommand: WrappedCommand<'ExerciseCommand'> = {
    ExerciseCommand: {
      templateId: AllocationInstruction.templateId,
      contractId: allocationInstructionCid,
      choice: 'AllocationInstruction_Update',
      choiceArgument: {
        extraActors: [sender.partyId, admin.partyId], // passing admin as the executor party
        extraArgs: emptyExtraArgs,
      } satisfies AllocationInstruction_Update,
    },
  };

  await sdk.userLedger?.setPartyId(sender.partyId);

  const signCompletionResult = await sdk.userLedger?.prepareSignExecuteAndWaitFor(
    allocationCreateCommand,
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

  const allocationEvent = result?.find(
    (event) => 'CreatedEvent' in event && event.CreatedEvent.templateId === CoinAllocation.templateIdWithPackageId,
  ) as { CreatedEvent: ledgerClientComponents['schemas']['CreatedEvent'] };

  logger.info({ allocationCid: allocationEvent.CreatedEvent.contractId });

  return allocationEvent.CreatedEvent.contractId;
};

export default createAllocation;

if (import.meta.main) {
  await createAllocation();
}
