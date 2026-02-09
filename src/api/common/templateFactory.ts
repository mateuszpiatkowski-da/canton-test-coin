import { LedgerController, type WrappedCommand } from '@canton-network/wallet-sdk';
import { randomUUIDv7 } from 'bun';
import admin from 'src/util/admin';
import sdk from 'src/util/walletSDK';

export default abstract class FetchTemplateFactory {
  private _factoryCID = '';

  constructor(private factoryTemplateId: string) {}

  public set factoryCID(cid: string) {
    this._factoryCID = cid;
  }

  public async getFactoryCID() {
    if (this._factoryCID) return this._factoryCID;
    await this.fetchFactoryCID();
    if (!this._factoryCID) await this.createFactory();
    return this._factoryCID;
  }

  private async fetchFactoryCID() {
    const { offset } = await sdk.userLedger!.ledgerEnd();
    const fetchedActiveContracts = await sdk.userLedger?.activeContracts({
      offset,
      parties: [admin.partyId],
      templateIds: [this.factoryTemplateId],
    });

    const activeContractId =
      fetchedActiveContracts?.[0]?.contractEntry &&
      LedgerController.getActiveContractCid(fetchedActiveContracts?.[0].contractEntry);

    if (activeContractId) this._factoryCID = activeContractId;
  }

  private async createFactory() {
    const command: WrappedCommand<'CreateCommand'> = {
      CreateCommand: {
        templateId: this.factoryTemplateId,
        createArguments: {
          admin: admin.partyId,
        },
      },
    };

    const signCompletionResult = await sdk.userLedger!.prepareSignExecuteAndWaitFor(
      command,
      [
        {
          partyId: admin.partyId,
          privateKey: admin.keyPair.privateKey,
        },
      ],
      randomUUIDv7(),
    );

    const result = await sdk.userLedger?.getCreatedContractByUpdateId(signCompletionResult.updateId);

    if (result?.contractId) this._factoryCID = result.contractId;
  }
}
