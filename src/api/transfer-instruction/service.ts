import Singleton from 'src/util/singleton';
import sdk from 'src/util/walletSDK';
import { LedgerController, type WrappedCommand } from '@canton-network/wallet-sdk';
import admin from 'src/util/admin';
import { CoinTransferFactory, CoinTransferInstruction } from '@daml-ts/test-coin-1.0.0/lib/Coin/Transfer/module';
import { randomUUIDv7 } from 'bun';

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

    const activeContractId =
      fetchedActiveContracts?.[0]?.contractEntry &&
      LedgerController.getActiveContractCid(fetchedActiveContracts?.[0].contractEntry);

    if (activeContractId) this.factoryCID = activeContractId;
    else await this.createTransferFactory();
    return this.factoryCID;
  }

  public async getTransferInstruction(cid: string) {
    const ledgerEnd = await sdk.userLedger!.ledgerEnd();
    const activeContracts = await sdk.userLedger?.activeContracts({
      parties: [admin.partyId],
      offset: ledgerEnd.offset,
      templateIds: [CoinTransferInstruction.templateId],
    });

    const activeContract = activeContracts?.find(
      (contract) => LedgerController.getActiveContractCid(contract.contractEntry) === cid,
    );

    if (!(activeContract && 'JsActiveContract' in activeContract.contractEntry)) throw new Error('No results found.');

    const jsActiveContract = activeContract?.contractEntry.JsActiveContract;

    return {
      synchronizerId: jsActiveContract.synchronizerId,
      contractId: jsActiveContract.createdEvent.contractId,
      templateId: jsActiveContract.createdEvent.templateId,
      createdEventBlob: jsActiveContract.createdEvent.createdEventBlob,
    };
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
      [
        {
          partyId: admin.partyId,
          privateKey: admin.keyPair.privateKey,
        },
      ],
      randomUUIDv7(),
    );

    const result = await sdk.userLedger?.getCreatedContractByUpdateId(signCompletionResult.updateId);

    if (result?.contractId) this.factoryCID = result?.contractId;
  }
}
