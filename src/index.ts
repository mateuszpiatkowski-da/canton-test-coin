import { serve } from 'bun';
import routes from './routes';
import logger from './util/logger';
import initializer from './util/init';
import { defaultNotFoundError } from './api/error';

const server = serve({
  port: process.env.PORT || 3001,
  routes,
  fetch() {
    return defaultNotFoundError;
  },
});

// Initialize prerequisites
await initializer.init();

logger.info(`Server running at ${server.url}`);
