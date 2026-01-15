import metadataApi from './api/metadata';
import { type Request as OpenAPIBackendRequest } from 'openapi-backend';

Promise.all([metadataApi.init()]);

// Adapter to convert Bun Request to OpenAPI Backend Request
const adaptBunRequest = (req: Request): OpenAPIBackendRequest => {
  const url = new URL(req.url);
  return {
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    method: req.method,
    headers: Object.fromEntries(req.headers),
    body: req.body,
  };
};

const registryRoutes = {
  '/metadata/*': (req: Request) => metadataApi.handleRequest(adaptBunRequest(req)),
};

export default {
  '/registry/*': async (req: Request) => {
    const url = new URL(req.url);
    const subPath = url.pathname.replace('/registry', '') || '/';

    // Basic manual routing logic
    const handler = registryRoutes[subPath as keyof typeof registryRoutes];
    return handler ? handler(req) : new Response('Not Found', { status: 404 });
  },
} satisfies Bun.Serve.Routes<undefined, string>;
