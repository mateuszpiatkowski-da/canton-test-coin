import { type Context } from 'openapi-backend';

export type ApiHandler = (ctx: Context, req: Request, res: Response) => Response;
