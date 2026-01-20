import metadataAPI from './api/metadata';
import { type Serve } from 'bun';

export default {
  '/registry/metadata/*': async (req: Request) => {
    return Response.json(await metadataAPI(req));
  },
} satisfies Serve.Routes<undefined, string>;
