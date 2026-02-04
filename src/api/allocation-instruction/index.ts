import * as openapi from '@openapi-ts/allocation-instruction-v1';

import { OpenAPIBackend } from 'openapi-backend';
import definition from '@token-standard/splice-api-token-allocation-instruction-v1/openapi/allocation-instruction-v1.yaml';
import { notFound } from '../error';
import allocationInstructionService from './service';

const api = new OpenAPIBackend({
  definition,
  quick: true,
});

const getAllocationFactory = async (): Promise<openapi.FactoryWithChoiceContext> => {
  return {
    factoryId: await allocationInstructionService.getFactoryCID(),
    choiceContext: {
      choiceContextData: {},
      disclosedContracts: [],
    },
  };
};

api.register({
  getAllocationFactory,
  notFound: () => notFound,
});

await api.init();

export default api;
