#!/usr/bin/env bun

import sdk from 'src/util/walletSDK';
import { type WrappedCommand } from '@canton-network/wallet-sdk';
import admin from 'src/util/admin';
import {
  TransferFactory,
  TransferFactory_Transfer,
} from '@daml-ts/splice-api-token-1.0.0/lib/Splice/Api/Token/TransferInstructionV1/module';
import { CoinTransferInstruction } from '@daml-ts/test-coin-1.0.0/lib/Coin/Transfer';
import { type components as ledgerClientComponents } from '@canton-network/core-ledger-client';
import transferService from 'src/api/transfer-instruction/service';
import helperInitializer from './util/helperInitializer';
import { randomUUIDv7 } from 'bun';
import { createLogger } from 'src/util/logger';
import emptyMeta from './util/emptyMeta';
import emptyExtraArgs from './util/emptyExtraArgs';

const logger = createLogger({ name: 'createTransferInstruction' });

const createTransferInstruction = async () => {
  await helperInitializer.init();

  const { sender, receiver, tokenCid } = helperInitializer.data;

  const factoryID = await transferService.getFactoryCID();

  const transferInstructionCommand: WrappedCommand<'ExerciseCommand'> = {
    ExerciseCommand: {
      templateId: TransferFactory.templateId,
      contractId: factoryID,
      choice: 'TransferFactory_Transfer',
      choiceArgument: {
        expectedAdmin: admin.partyId,
        extraArgs: emptyExtraArgs,
        transfer: {
          sender: sender.partyId,
          receiver: receiver.partyId,
          amount: '100.5',
          instrumentId: {
            admin: admin.partyId,
            id: 'TestCoin',
          },
          requestedAt: helperInitializer.requestedAt.toISOString(),
          executeBefore: helperInitializer.executeBefore.toISOString(),
          inputHoldingCids: [tokenCid],
          meta: emptyMeta,
        },
      } satisfies TransferFactory_Transfer,
    },
  };

  await sdk.userLedger?.setPartyId(sender.partyId);

  const signCompletionResult = await sdk.userLedger?.prepareSignExecuteAndWaitFor(
    transferInstructionCommand,
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

  const transferInstructionEvent = result?.find(
    (event) =>
      'CreatedEvent' in event && event.CreatedEvent.templateId === CoinTransferInstruction.templateIdWithPackageId,
  ) as { CreatedEvent: ledgerClientComponents['schemas']['CreatedEvent'] };

  logger.info({ transferInstructionCid: transferInstructionEvent.CreatedEvent.contractId });

  return transferInstructionEvent.CreatedEvent.contractId;
};

export default createTransferInstruction;

if (import.meta.main) {
  await createTransferInstruction();
}
