import { CoinAllocationInstructionFactory } from '@daml-ts/test-coin-1.0.0/lib/Coin/Allocation/Instruction';
import type { WrappedCommand } from '@canton-network/wallet-sdk';
import type { PartyId } from '@canton-network/core-types';
import FetchTemplateFactory from 'src/api/common/templateFactory';
import sdk from 'src/util/walletSDK';
import admin from 'src/util/admin';
import { randomUUIDv7 } from 'bun';

class AllocationInstructionService extends FetchTemplateFactory {
  constructor() {
    super(CoinAllocationInstructionFactory.templateId);
  }

  public async addSenders(senders: PartyId[]) {
    const command: WrappedCommand<'ExerciseCommand'> = {
      ExerciseCommand: {
        templateId: CoinAllocationInstructionFactory.templateId,
        contractId: await this.getFactoryCID(),
        choice: CoinAllocationInstructionFactory.AddObserver.choiceName,
        choiceArgument: {
          newSenders: senders,
        },
      },
    };
    const exerciseResult = await sdk.userLedger?.prepareSignExecuteAndWaitFor(
      command,
      [
        {
          partyId: admin.partyId,
          privateKey: admin.keyPair.privateKey,
        },
      ],
      randomUUIDv7(),
    );

    if (!exerciseResult?.updateId) throw new Error('updateId not found');

    const result = await sdk.userLedger?.getCreatedContractByUpdateId(exerciseResult?.updateId);

    if (!result?.contractId) throw new Error('contractId not found');

    this.factoryCID = result?.contractId;
  }
}

const service = new AllocationInstructionService();
export default service;
