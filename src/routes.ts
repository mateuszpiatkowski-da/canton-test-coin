import metadataApi from './api/metadata';
import transferInstructionApi from './api/transfer-instruction';
import { type Request as OpenAPIBackendRequest } from 'openapi-backend';
import { type BunRequest, type Serve } from 'bun';

// Adapter to convert Bun Request to OpenAPI Backend Request
const adaptBunRequest = (req: BunRequest): OpenAPIBackendRequest => {
  const url = new URL(req.url);
  return {
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    method: req.method,
    headers: Object.fromEntries(req.headers),
    body: req.body,
  };
};

export default {
  '/registry/metadata/v1/*': async (req: BunRequest) => {
    return Response.json(await metadataApi.handleRequest(adaptBunRequest(req)));
  },
  '/registry/transfer-instruction/v1/*': async (req: BunRequest) => {
    return Response.json(await transferInstructionApi.handleRequest(adaptBunRequest(req)));
  },
} satisfies Serve.Routes<undefined, string>;
