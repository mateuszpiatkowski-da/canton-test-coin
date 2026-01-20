import pino from 'pino';

export const createLogger = (options: { name: string }) =>
  pino({
    name: options.name,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  });

export default createLogger({ name: 'server' });
