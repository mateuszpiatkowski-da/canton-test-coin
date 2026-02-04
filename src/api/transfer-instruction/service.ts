import sdk from 'src/util/walletSDK';
import { LedgerController } from '@canton-network/wallet-sdk';
import admin from 'src/util/admin';
import { CoinTransferFactory, CoinTransferInstruction } from '@daml-ts/test-coin-1.0.0/lib/Coin/Transfer/module';
import FetchTemplateFactory from 'src/api/common/factory';

class TransferService extends FetchTemplateFactory {
  constructor() {
    super(CoinTransferFactory.templateId);
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
}

const service = new TransferService();
export default service;
