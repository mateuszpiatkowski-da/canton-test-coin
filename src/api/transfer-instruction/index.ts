import definition from '@token-standard/splice-api-token-transfer-instruction-v1/openapi/transfer-instruction-v1.yaml';
import * as openapi from '@openapi-ts/transfer-instruction-v1';
import OpenAPIBackend, { type Context } from 'openapi-backend';
import { badRequestError, defaultNotFoundError, internalError } from '../error';
import transferService from './service';

const api = new OpenAPIBackend({ definition, quick: true });

const getTransferFactory = async (ctx: Context): Promise<Response> => {
  try {
    const requestBody = await ctx.request.body.json();
    const { senderParty, receiverParty } = requestBody.choiceArguments;
    if (!senderParty || !receiverParty)
      return badRequestError('Either sender or receiver were not passed as choiceArguments');

    let transferKind: openapi.TransferFactoryWithChoiceContext['transferKind'] = 'offer';
    if (senderParty === receiverParty) transferKind = 'self';
    const factoryId = await transferService.getFactoryCID();
    return Response.json({
      factoryId,
      transferKind,
      choiceContext: {
        choiceContextData: {},
        disclosedContracts: [],
      },
    } satisfies openapi.TransferFactoryWithChoiceContext);
  } catch (error) {
    return internalError(`Failed to get transfer factory: ${error}`);
  }
};

const getTransferInstructionAcceptContext = async (ctx: Context): Promise<Response> => {
  try {
    const disclosedContract = await transferService.getTransferInstruction(ctx.request.params.transferInstructionId);
    return Response.json({
      choiceContextData: {},
      disclosedContracts: [disclosedContract],
    } satisfies openapi.ChoiceContext);
  } catch (error) {
    return internalError(
      `Failed to get transfer instruction accept context for id '${ctx.request.params.transferInstructionId}': ${error}`,
    );
  }
};

const getTransferInstructionRejectContext = async (ctx: Context): Promise<Response> => {
  try {
    const disclosedContract = await transferService.getTransferInstruction(ctx.request.params.transferInstructionId);
    return Response.json({
      choiceContextData: {},
      disclosedContracts: [disclosedContract],
    } satisfies openapi.ChoiceContext);
  } catch (error) {
    return internalError(
      `Failed to get transfer instruction reject context for id '${ctx.request.params.transferInstructionId}': ${error}`,
    );
  }
};

const getTransferInstructionWithdrawContext = async (ctx: Context): Promise<Response> => {
  try {
    const disclosedContract = await transferService.getTransferInstruction(ctx.request.params.transferInstructionId);
    return Response.json({
      choiceContextData: {},
      disclosedContracts: [disclosedContract],
    } satisfies openapi.ChoiceContext);
  } catch (error) {
    return internalError(
      `Failed to get transfer instruction withdraw context for id '${ctx.request.params.transferInstructionId}': ${error}`,
    );
  }
};

api.register({
  getTransferFactory,
  getTransferInstructionAcceptContext,
  getTransferInstructionRejectContext,
  getTransferInstructionWithdrawContext,
  notFound: () => defaultNotFoundError,
});

await api.init();

export default api;
