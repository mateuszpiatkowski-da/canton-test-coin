import Singleton from 'src/util/singleton';
import sdk from 'src/util/walletSDK';
import type { WrappedCommand } from '@canton-network/wallet-sdk';
import { v4 } from 'uuid';
import admin from 'src/util/admin';
import { CoinTransferFactory } from 'src/daml-ts/test-coin-1.0.0/lib/Coin/Transfer/module';

export default class TransferService extends Singleton {
  private factoryCID: string = '';

  constructor() {
    super();
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

    const result = await sdk.userLedger!.prepareSignExecuteAndWaitFor(proposal, admin.keyPair.privateKey, v4());

    console.log('RESULT', result);

    this.factoryCID = result.updateId;
  }

  public async getTransferFactory() {
    if (!this.factoryCID.length) await this.createTransferFactory();
    return {
      factoryId: this.factoryCID,
    };
  }
}
