import * as types from '@openapi/splice-api-token-transfer-instruction-v1/transfer-instruction-v1';
import definition from '@token-standard/splice-api-token-transfer-instruction-v1/openapi/transfer-instruction-v1.yaml';
import OpenAPIBackend, { type Handler } from 'openapi-backend';
import TransferService from './service';

const api = new OpenAPIBackend({ definition, quick: true });
const service = TransferService.getInstance();

const getTransferFactory: Handler = async () => {
  const factoryId = await service.getTransferFactoryId();
  return Response.json({
    factoryId,
    transferKind: 'offer',
    choiceContext: {
      choiceContextData: {},
      disclosedContracts: [],
    },
  } satisfies types.paths['/registry/transfer-instruction/v1/transfer-factory']['post']['responses']['200']['content']['application/json']);
};

const getTransferInstructionAcceptContext: Handler = () => {
  return Response.json({
    choiceContextData: {},
    disclosedContracts: [],
  } satisfies types.paths['/registry/transfer-instruction/v1/{transferInstructionId}/choice-contexts/accept']['post']['responses']['200']['content']['application/json']);
};

const getTransferInstructionRejectContext: Handler = () => {
  return Response.json({
    choiceContextData: {},
    disclosedContracts: [],
  } satisfies types.paths['/registry/transfer-instruction/v1/{transferInstructionId}/choice-contexts/reject']['post']['responses']['200']['content']['application/json']);
};

const getTransferInstructionWithdrawContext: Handler = () => {
  return Response.json({
    choiceContextData: {},
    disclosedContracts: [],
  } satisfies types.paths['/registry/transfer-instruction/v1/{transferInstructionId}/choice-contexts/withdraw']['post']['responses']['200']['content']['application/json']);
};

api.register({
  getTransferFactory,
  getTransferInstructionAcceptContext,
  getTransferInstructionRejectContext,
  getTransferInstructionWithdrawContext,
});

await api.init();

export default api;
