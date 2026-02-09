import * as openapi from '@openapi-ts/allocation-v1';

import { OpenAPIBackend, type Context } from 'openapi-backend';
import definition from '@token-standard/splice-api-token-allocation-v1/openapi/allocation-v1.yaml';
import { notFound } from '../error';
import admin from 'src/util/admin';
import sdk from 'src/util/walletSDK';
import { CoinAllocation } from '@daml-ts/test-coin-1.0.0/lib/Coin/Allocation/Allocation';

const api = new OpenAPIBackend({
  definition,
  quick: true,
});

const getAllocationTransferContext = async (ctx: Context): Promise<openapi.ChoiceContext> => {
  const { allocationId } = ctx.request.params;
  console.log('allocationId', allocationId);
  const offset = (await sdk.userLedger?.ledgerEnd())!.offset;
  const allocationContract = await sdk.userLedger?.activeContracts({
    offset,
    templateIds: [CoinAllocation.templateId],
  });

  console.log('allocationContract', allocationContract);
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
