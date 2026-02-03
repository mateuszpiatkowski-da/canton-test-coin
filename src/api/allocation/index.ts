import * as openapi from '@openapi-ts/allocation-v1';

import { OpenAPIBackend, type Context } from 'openapi-backend';
import definition from '@token-standard/splice-api-token-allocation-v1/openapi/allocation-v1.yaml';
import { notFound } from '../error';
import admin from 'src/util/admin';

const api = new OpenAPIBackend({
  definition,
  quick: true,
});

const getAllocationTransferContext = async (): Promise<openapi.ChoiceContext> => {
  return {
    choiceContextData: {},
    disclosedContracts: [],
  };
};

const getAllocationWithdrawContext = (): openapi.ChoiceContext => {
  return {
    choiceContextData: {},
    disclosedContracts: [],
  };
};

const getAllocationCancelContext = (): openapi.ChoiceContext => {
  return {
    choiceContextData: {},
    disclosedContracts: [],
  };
};

api.register({
  getAllocationTransferContext,
  getAllocationWithdrawContext,
  getAllocationCancelContext,
  notFound: () => notFound,
});

await api.init();

export default api;
