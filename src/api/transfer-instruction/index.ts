import definition from '@token-standard/splice-api-token-transfer-instruction-v1/openapi/transfer-instruction-v1.yaml';
import * as openapi from '@openapi-ts/transfer-instruction-v1';
import OpenAPIBackend, { type Context } from 'openapi-backend';
import TransferService from './service';

const api = new OpenAPIBackend({ definition, quick: true });
const service = TransferService.getInstance();

const getTransferFactory = async (): Promise<openapi.TransferFactoryWithChoiceContext> => {
  const factoryId = await service.getTransferFactoryId();
  return {
    factoryId,
    transferKind: 'offer',
    choiceContext: {
      choiceContextData: {},
      disclosedContracts: [],
    },
  };
};

const getTransferInstructionAcceptContext = async (ctx: Context): Promise<openapi.ChoiceContext> => {
  const disclosedContract = await service.getTransferInstruction(ctx.request.params.transferInstructionId);
  return {
    choiceContextData: {},
    disclosedContracts: [disclosedContract],
  };
};

const getTransferInstructionRejectContext = async (): Promise<openapi.ChoiceContext> => {
  return {
    choiceContextData: {},
    disclosedContracts: [],
  };
};

const getTransferInstructionWithdrawContext = async (): Promise<openapi.ChoiceContext> => {
  return {
    choiceContextData: {},
    disclosedContracts: [],
  };
};

api.register({
  getTransferFactory,
  getTransferInstructionAcceptContext,
  getTransferInstructionRejectContext,
  getTransferInstructionWithdrawContext,
});

await api.init();

export default api;
