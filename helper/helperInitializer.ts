import Initializer from 'src/util/init';
import getAdmin from './getAdmin';
import admin from 'src/util/admin';
import sdk from 'src/util/walletSDK';

export default class HelperInitializer extends Initializer {
  constructor() {
    super();
  }

  public override async init() {
    await this.helperSetupAdmin();
    await sdk.connectTopology(sdk.userLedger!.getSynchronizerId());
  }

  private async helperSetupAdmin() {
    const adminId = await getAdmin();
    admin.partyId = adminId;
    await sdk.setPartyId(admin.partyId);
  }
}
