import { LedgerController, type WrappedCommand } from '@canton-network/wallet-sdk';
import { randomUUIDv7 } from 'bun';
import admin from 'src/util/admin';
import sdk from 'src/util/walletSDK';

export default abstract class FetchTemplateFactory {
  protected factoryCID = '';

  constructor(private factoryTemplateId: string) {}

  public async getFactoryCID() {
    if (this.factoryCID) return this.factoryCID;
    await this.fetchFactoryCID();
    if (!this.factoryCID) await this.createFactory();
    return this.factoryCID;
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

    if (activeContractId) this.factoryCID = activeContractId;
  }

  private async createFactory() {
    const proposal: WrappedCommand<'CreateCommand'> = {
      CreateCommand: {
        templateId: this.factoryTemplateId,
        createArguments: {
          admin: admin.partyId,
        },
      },
    };

    const signCompletionResult = await sdk.userLedger!.prepareSignExecuteAndWaitFor(
      proposal,
      [
        {
          partyId: admin.partyId,
          privateKey: admin.keyPair.privateKey,
        },
      ],
      randomUUIDv7(),
    );

    const result = await sdk.userLedger?.getCreatedContractByUpdateId(signCompletionResult.updateId);

    if (result?.contractId) this.factoryCID = result.contractId;
  }
}
