import type { ContractId, TemplateId } from '@canton-network/core-wallet-dapp-remote-rpc-client';
import type { DisclosedContract } from '@openapi-ts/allocation-v1';
import type { JsActiveContract } from 'splice-wallet-kernel/core/ledger-client/src/generated-clients/asyncapi-3.4.7';
import { LedgerController } from 'splice-wallet-kernel/sdk/wallet-sdk/dist';
import admin from 'src/util/admin';
import sdk from 'src/util/walletSDK';

export default class ContractService {
  private activeContract?: JsActiveContract;

  constructor(
    private cid: ContractId,
    private template: TemplateId,
  ) {}

  public async fetchContract() {
    if (this.activeContract) return this.activeContract;
    const ledgerEnd = await sdk.userLedger!.ledgerEnd();
    const activeContracts = await sdk.userLedger?.activeContracts({
      parties: [admin.partyId],
      offset: ledgerEnd.offset,
      templateIds: [this.template],
    });

    const activeContract = activeContracts?.find(
      (contract) => LedgerController.getActiveContractCid(contract.contractEntry) === this.cid,
    );

    if (!(activeContract && 'JsActiveContract' in activeContract.contractEntry)) throw new Error('No results found.');

    this.activeContract = activeContract.contractEntry.JsActiveContract as JsActiveContract;
    return activeContract;
  }

  public async getDisclosedContract(): Promise<DisclosedContract> {
    if (!this.activeContract) await this.fetchContract();
    return {
      synchronizerId: this.activeContract!.synchronizerId,
      contractId: this.activeContract!.createdEvent.contractId,
      templateId: this.activeContract!.createdEvent.templateId,
      createdEventBlob: this.activeContract!.createdEvent.createdEventBlob,
    };
  }
}
