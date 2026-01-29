import { OpenAPIBackend, type Handler } from 'openapi-backend';
import definition from '@token-standard/splice-api-token-metadata-v1/openapi/token-metadata-v1.yaml';
import * as types from '@openapi/splice-api-token-metadata-v1/token-metadata-v1';
import { notFound } from '../error';

const api = new OpenAPIBackend({
  definition,
  quick: true,
});

const supportedApis = {
  'splice-api-token-metadata-v1': 1,
  'splice-api-token-transfer-instruction-v1': 1,
  'splice-api-token-allocation-v1': 1,
  'splice-api-token-allocation-instruction-v1': 1,
};

const instruments = [
  {
    id: 'TestCoin',
    name: 'TestCoin',
    symbol: 'test-coin',
    totalSupply: '1_000_000_000',
    totalSupplyAsOf: '2026-01-23T09:49:23.104Z',
    decimals: 2,
    supportedApis,
  },
];

const getRegistryInfo: Handler = () => {
  return Response.json({
    adminId: 'test-coin-admin',
    supportedApis,
  } satisfies types.paths['/registry/metadata/v1/info']['get']['responses']['200']['content']['application/json']);
};

const listInstruments: Handler = () => {
  return Response.json({
    instruments,
  } satisfies types.paths['/registry/metadata/v1/instruments']['get']['responses']['200']['content']['application/json']);
};

const getInstrument: Handler = (ctx) => {
  const instrument = instruments.find((instrument) => instrument.id === ctx.request.params.instrumentId);

  if (!instrument) return notFound;
  return Response.json(
    instrument satisfies types.paths['/registry/metadata/v1/instruments/{instrumentId}']['get']['responses']['200']['content']['application/json'],
  );
};

api.register({
  getRegistryInfo,
  listInstruments,
  getInstrument,
  notFound: () => notFound,
});

await api.init();

export default api;
