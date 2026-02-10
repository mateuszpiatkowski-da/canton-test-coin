export const notFoundError = (reason?: string) =>
  Response.json(
    {
      error: reason ?? 'Not Found',
    },
    { status: 404 },
  );

export const internalError = (reason?: string) =>
  Response.json(
    {
      error: reason ?? 'Internal Server Error',
    },
    { status: 500 },
  );

export const badRequestError = (reason?: string) =>
  Response.json(
    {
      error: reason ?? 'Bad Request',
    },
    { status: 400 },
  );

export const defaultNotFoundError = notFoundError();
export const defaultInternalError = internalError();
export const defaultBadRequestError = badRequestError();
