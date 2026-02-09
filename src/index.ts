import { serve } from 'bun';
import routes from './routes';
import logger from './util/logger';
import initializer from './util/init';
import { notFound } from './api/error';
import sdk from './util/walletSDK';

const server = serve({
  port: process.env.PORT || 3001,
  routes,
  fetch() {
    return notFound;
  },
});

console.log(await sdk.auth.getAdminToken());

// Initialize prerequisites
await initializer.init();

logger.info(`Server running at ${server.url}`);
