import logger from './logger';
import { $, file } from 'bun';
import { join } from 'path';
import { readdirSync } from 'fs';
import sdk from '../util/walletSDK';
import Singleton from './singleton';
import { createKeyPair } from '@canton-network/wallet-sdk';
import admin from './admin';
import { packageId } from 'src/daml-ts/test-coin-1.0.0/lib';

type DARType = {
  path: string;
  files: string[];
};

export default class Initializer extends Singleton {
  private dar: DARType | null = null;

  constructor() {
    super();
  }

  public async init() {
    logger.info({ packageId }, 'Using .dar package');

    const distDir = join(import.meta.dirname, '../../daml/.daml/dist');
    let darFiles = readdirSync(distDir)
      .filter((f) => /^test-coin-.*\.dar$/.test(f))
      .sort();
    const darPath = join(distDir, darFiles[darFiles.length - 1]!);
    if (darFiles.length === 0) {
      logger.info('Building .dar files...');
      await $`bun daml:rebuild`.quiet();
      darFiles = readdirSync(distDir)
        .filter((f) => /^test-coin-.*\.dar$/.test(f))
        .sort();
      logger.info('.dar files built successfully');
    }

    this.dar = {
      path: darPath,
      files: darFiles,
    };

    await this.setupAdmin();
    await sdk.connectTopology(sdk.userLedger!.getSynchronizerId());
    await this.uploadDar();
  }

  private async setupAdmin() {
    const { privateKey, publicKey } = createKeyPair();
    admin.keyPair.privateKey = privateKey;
    admin.keyPair.publicKey = publicKey;

    const transactionResponse = await sdk.userLedger?.signAndAllocateExternalParty(privateKey, 'admin');
    admin.partyId = transactionResponse!.partyId;
    await sdk.setPartyId(admin.partyId);
    logger.info('Successfully created admin party');
  }

  private async uploadDar() {
    if (!this.dar) return;
    if (await sdk.userLedger?.isPackageUploaded(packageId)) {
      logger.info({ dar: this.dar.files[this.dar.files.length - 1] }, 'DAR already uploaded, skipping...');
      return;
    }
    try {
      const darBytes = await file(this.dar.path);
      await sdk.adminLedger?.uploadDar(new Uint8Array(await darBytes.arrayBuffer()));
      logger.info({ dar: this.dar.files[this.dar.files.length - 1] }, 'DAR uploaded');
    } catch (error: any) {
      if (error.code === 'KNOWN_PACKAGE_VERSION') {
        logger.info({ dar: this.dar.files[this.dar.files.length - 1] }, 'DAR already uploaded, skipping...');
        return;
      }
      logger.error({ error }, 'DAR upload failed');
      throw error;
    }
  }
}
