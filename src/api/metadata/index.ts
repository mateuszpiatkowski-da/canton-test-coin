import { OpenAPIBackend, type Context } from 'openapi-backend';
import definition from '@token-standard/splice-api-token-metadata-v1/openapi/token-metadata-v1.yaml';
import { notFoundError, internalError, defaultNotFoundError } from '../error';
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
    id: 'test-coin',
    name: 'TestCoin',
    symbol: 'test-coin',
    totalSupply: '1_000_000_000',
    totalSupplyAsOf: '2026-01-23T09:49:23.104Z',
    decimals: 2,
    supportedApis,
  },
];

const getRegistryInfo = async (): Promise<Response> => {
  try {
    return Response.json({
      adminId: admin.partyId,
      supportedApis,
    } satisfies openapi.GetRegistryInfoResponse);
  } catch (error) {
    return internalError(`Failed to get registry info: ${error}`);
  }
};

const listInstruments = (): Response => {
  // we don't need to use pageSize & pageToken here
  try {
    return Response.json({
      instruments,
      nextPageToken: undefined,
    } satisfies openapi.ListInstrumentsResponse);
  } catch (error) {
    return internalError(`Failed to list instruments: ${error}`);
  }
};

const getInstrument = (ctx: Context): Response => {
  try {
    const instrument = instruments.find((instrument) => instrument.id === ctx.request.params.instrumentId);

    if (!instrument) return notFoundError(`Instrument with id '${ctx.request.params.instrumentId}' not found`);
    return Response.json(instrument satisfies openapi.Instrument);
  } catch (error) {
    return internalError(`Failed to get instrument: ${error}`);
  }
};

api.register({
  getRegistryInfo,
  listInstruments,
  getInstrument,
  notFound: () => defaultNotFoundError,
});

await api.init();

export default api;
