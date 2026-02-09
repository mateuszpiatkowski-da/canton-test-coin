import { Initializer } from 'src/util/init';
import getAdmin from './getAdmin';
import admin from 'src/util/admin';
import sdk from 'src/util/walletSDK';
import { createKeyPair, type WrappedCommand } from '@canton-network/wallet-sdk';
import { CoinToken } from '@daml-ts/test-coin-1.0.0/lib/Coin/Holding/module';
import { randomUUIDv7 } from 'bun';
import type { KeyPair } from '@canton-network/core-signing-lib';
import type { ContractId } from '@daml/types';
import type { Holding } from '@daml-ts/splice-api-token-1.0.0/lib/Splice/Api/Token/HoldingV1/module';

type Party = {
  keyPair: KeyPair;
  partyId: string;
};

class HelperInitializer extends Initializer {
  private sender: Party | null = null;
  private receiver: Party | null = null;
  private initialized = false;
  private tokenCid: ContractId<Holding> | null = null;
  public requestedAt = new Date();
  public executeBefore = new Date();

  constructor() {
    super();
    this.executeBefore.setHours(this.executeBefore.getHours() + 24);
  }

  public override async init() {
    if (this.initialized) return;
    await this.helperSetupAdmin();
    await sdk.connectTopology(sdk.userLedger!.getSynchronizerId());
    this.sender = await this.initializeParty('sender');
    this.receiver = await this.initializeParty('receiver');
    this.tokenCid = await this.createToken();
    this.initialized = true;
  }

  public get data() {
    if (!this.initialized) throw new Error("Can't obtain data without initializing first");
    return {
      sender: this.sender as Party,
      receiver: this.receiver as Party,
      tokenCid: this.tokenCid as ContractId<Holding>,
    };
  }

  private async helperSetupAdmin() {
    const adminId = await getAdmin();
    admin.partyId = adminId;
    await sdk.setPartyId(admin.partyId);
  }

  private async initializeParty(partyName: string): Promise<Party> {
    const keyPair = createKeyPair();
    return {
      keyPair,
      partyId: (await sdk.userLedger?.signAndAllocateExternalParty(keyPair.privateKey, partyName))!.partyId,
    };
  }

  private async createToken() {
    const tokenCommand: WrappedCommand<'CreateCommand'> = {
      CreateCommand: {
        templateId: CoinToken.templateId,
        createArguments: {
          admin: admin.partyId,
          owner: this.sender!.partyId,
          amount: '200.0',
          createdAt: this.requestedAt.toISOString(),
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
    return token.contractId as any as ContractId<Holding>;
  }
}

const helperInitializer = new HelperInitializer();
export default helperInitializer;
