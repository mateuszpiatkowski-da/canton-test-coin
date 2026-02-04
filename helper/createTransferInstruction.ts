#!/usr/bin/env bun

import sdk from 'src/util/walletSDK';
import { createKeyPair, type WrappedCommand } from '@canton-network/wallet-sdk';
import admin from 'src/util/admin';
import { ContractId, type TransferFactory_Transfer, Holding } from '@canton-network/core-token-standard';
import { CoinToken } from '@daml-ts/test-coin-1.0.0/lib/Coin/Holding';
import { TransferFactory } from '@daml-ts/splice-api-token-1.0.0/lib/Splice/Api/Token/TransferInstructionV1/module';
import { CoinTransferInstruction } from '@daml-ts/test-coin-1.0.0/lib/Coin/Transfer';
import { type components as ledgerClientComponents } from '@canton-network/core-ledger-client';
import transferService from 'src/api/transfer-instruction/service';
import helperInitializer from './helperInitializer';
import { randomUUIDv7 } from 'bun';
import { createLogger } from 'src/util/logger';

const logger = createLogger({ name: 'createTransferInstruction' });

await helperInitializer.init();

const factoryID = await transferService.getFactoryCID();

const senderKey = createKeyPair();
const receiverKey = createKeyPair();

const sender = await sdk.userLedger?.signAndAllocateExternalParty(senderKey.privateKey, 'sender')!;
const receiver = await sdk.userLedger?.signAndAllocateExternalParty(receiverKey.privateKey, 'receiver')!;
const requestedAt = new Date();
const executeBefore = new Date();
executeBefore.setHours(executeBefore.getHours() + 24);

const tokenCommand: WrappedCommand<'CreateCommand'> = {
  CreateCommand: {
    templateId: CoinToken.templateId,
    createArguments: {
      admin: admin.partyId,
      owner: sender.partyId,
      amount: '200.0',
      createdAt: requestedAt.toISOString(),
    },
  },
};

const tokenData = await sdk.userLedger?.prepareSignExecuteAndWaitFor(
  tokenCommand,
  [{ partyId: admin.partyId, privateKey: admin.keyPair.privateKey }],
  randomUUIDv7(),
);
const token = await sdk.userLedger?.getCreatedContractByUpdateId(tokenData!.updateId)!;

// Type cast to work around duplicate @daml/types instances in node_modules
const tokenCid = token.contractId as any as ContractId<Holding>;

const transferInstructionCommand: WrappedCommand<'ExerciseCommand'> = {
  ExerciseCommand: {
    templateId: TransferFactory.templateId,
    contractId: factoryID,
    choice: 'TransferFactory_Transfer',
    choiceArgument: {
      expectedAdmin: admin.partyId,
      extraArgs: {
        context: {
          values: {},
        },
        meta: {
          values: {},
        },
      },
      transfer: {
        sender: sender.partyId,
        receiver: receiver.partyId,
        amount: '100.5',
        instrumentId: {
          admin: admin.partyId,
          id: 'TestCoin',
        },
        requestedAt: requestedAt.toISOString(),
        executeBefore: executeBefore.toISOString(),
        inputHoldingCids: [tokenCid],
        meta: {
          values: {},
        },
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
      privateKey: senderKey.privateKey,
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
