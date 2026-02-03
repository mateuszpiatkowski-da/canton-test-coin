import { OpenAPIBackend, type Context } from 'openapi-backend';
import definition from '@token-standard/splice-api-token-metadata-v1/openapi/token-metadata-v1.yaml';
import { notFound } from '../error';
import * as openapi from 'src/types/openapi-ts/token-metadata-v1';
import admin from 'src/util/admin';

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

const getRegistryInfo = async (): Promise<openapi.GetRegistryInfoResponse> => {
  return {
    adminId: admin.partyId,
    supportedApis,
  };
};

const listInstruments = (): openapi.ListInstrumentsResponse => {
  return {
    instruments,
  };
};

const getInstrument = (ctx: Context) => {
  const instrument = instruments.find((instrument) => instrument.id === ctx.request.params.instrumentId);

  if (!instrument) throw new Error(notFound.statusText);
  return instrument;
};

api.register({
  getRegistryInfo,
  listInstruments,
  getInstrument,
  notFound: () => notFound,
});

await api.init();

export default api;
