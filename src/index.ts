import { $, serve, file } from 'bun';
import { fileURLToPath } from 'url';
import { join } from 'path';
import { readdirSync } from 'fs';
import routes from './routes';
import sdk from './walletSdk';
import logger from './logger';

const __dirname = join(fileURLToPath(import.meta.url), '..');

const init = async () => {
  const distDir = join(__dirname, '../daml/.daml/dist');
  const darFiles = readdirSync(distDir)
    .filter((f) => /^test-coin-.*\.dar$/.test(f))
    .sort();

  if (darFiles.length === 0) {
    logger.info('Building .dar files...');
    await $`bun daml:rebuild`.quiet();
    return await init();
  }

  const darPath = join(distDir, darFiles[darFiles.length - 1]!);
  const darBytes = await file(darPath);
  try {
    await sdk.adminLedger?.uploadDar(new Uint8Array(await darBytes.arrayBuffer()));
  } catch (error: unknown) {
    const err = error as { code?: string };
    // Ignore KNOWN_PACKAGE_VERSION errors - the package already exists on the ledger
    if (err?.code !== 'KNOWN_PACKAGE_VERSION') {
      throw error;
    }
  }
};

const server = serve({
  port: import.meta.env.PORT || 3000,
  routes,
  fetch() {
    return new Response('Not Found', { status: 404 });
  },
});

await init();

logger.info(`✓ Server running at ${server.url}`);
