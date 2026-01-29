import { localNetStaticConfig, WalletSDKImpl } from '@canton-network/wallet-sdk';
import { createLogger } from '../util/logger';
import Singleton from './singleton';

const logger = createLogger({ name: 'WalletSDK' });

class TestCoinWalletSDK extends Singleton {
  public impl = new WalletSDKImpl();

  constructor() {
    super();
    this.impl.configure({
      logger,
    });
  }

  public async init() {
    // Initialize SDK connections
    await Promise.all([
      this.impl.connect(),
      this.impl.connectAdmin(),
      this.impl.connectTopology(localNetStaticConfig.LOCALNET_SCAN_PROXY_API_URL),
    ]);
    logger.info('SDK connected');
  }
}

const testCoinWalletSDK = TestCoinWalletSDK.getInstance();
await testCoinWalletSDK.init();

export default testCoinWalletSDK.impl;
