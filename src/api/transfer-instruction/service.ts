import Singleton from 'src/util/singleton';
import sdk from 'src/util/walletSDK';
import type { WrappedCommand } from '@canton-network/wallet-sdk';
import { v4 } from 'uuid';
import admin from 'src/util/admin';
import { CoinTransferFactory } from 'src/daml-ts/test-coin-1.0.0/lib/Coin/Transfer/module';
import type { components } from '@canton-network/core-ledger-client';

export default class TransferService extends Singleton {
  private factoryCID: string = '';

  constructor() {
    super();
  }

  public async getTransferFactoryId() {
    if (this.factoryCID) return this.factoryCID;
    const { offset } = await sdk.userLedger!.ledgerEnd();
    const fetchedActiveContracts = await sdk.userLedger?.activeContracts({
      offset,
      parties: [admin.partyId],
      templateIds: [CoinTransferFactory.templateId],
    });
    const possibleContract = fetchedActiveContracts?.[0]?.contractEntry.JsActiveContract;

    if (possibleContract)
      this.factoryCID = (possibleContract as components['schemas']['JsActiveContract']).createdEvent.contractId;
    else await this.createTransferFactory();
    return this.factoryCID;
  }

  private async createTransferFactory() {
    const proposal: WrappedCommand<'CreateCommand'> = {
      CreateCommand: {
        templateId: CoinTransferFactory.templateId,
        createArguments: {
          admin: admin.partyId,
        },
      },
    };

    const signCompletionResult = await sdk.userLedger!.prepareSignExecuteAndWaitFor(
      proposal,
      admin.keyPair.privateKey,
      v4(),
    );

    const result = await sdk.userLedger?.getCreatedContractByUpdateId(signCompletionResult.updateId);

    if (result?.contractId) this.factoryCID = result?.contractId;
  }
}
