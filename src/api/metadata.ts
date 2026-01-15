import { OpenAPIBackend, type Context, type Handler } from 'openapi-backend';
import definition from '@splice/token-standard/splice-api-token-metadata-v1/openapi/token-metadata-v1.yaml';

const api = new OpenAPIBackend({ definition, quick: true });

const getRegistryInfo: Handler = (ctx: Context, req: Request, res: Response) => {
  console.log(ctx, req, res);
};

const listInstruments: Handler = (ctx: Context, req: Request, res: Response) => {};

const getInstrument: Handler = (ctx: Context, req: Request, res: Response) => {};

api.register({
  getRegistryInfo,
  listInstruments,
  getInstrument,
});

export default api;
