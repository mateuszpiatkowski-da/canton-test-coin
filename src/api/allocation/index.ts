import * as openapi from '@openapi-ts/allocation-v1';
import { OpenAPIBackend, type Context } from 'openapi-backend';
import definition from '@token-standard/splice-api-token-allocation-v1/openapi/allocation-v1.yaml';
import { notFound } from '../error';
import allocationService from './service';

const api = new OpenAPIBackend({
  definition,
  quick: true,
});

const getAllocationTransferContext = async (ctx: Context): Promise<openapi.ChoiceContext> => {
  const contract = await allocationService.getAllocation(ctx.request.params.allocationId);

  return {
    choiceContextData: {},
    disclosedContracts: [contract],
  };
};

const getAllocationWithdrawContext = async (ctx: Context): Promise<openapi.ChoiceContext> => {
  const contract = await allocationService.getAllocation(ctx.request.params.allocationId);

  return {
    choiceContextData: {},
    disclosedContracts: [contract],
  };
};

const getAllocationCancelContext = async (ctx: Context): Promise<openapi.ChoiceContext> => {
  const contract = await allocationService.getAllocation(ctx.request.params.allocationId);

  return {
    choiceContextData: {},
    disclosedContracts: [contract],
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
