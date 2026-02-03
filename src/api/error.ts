export const notFound = Response.json(
  {
    error: 'Not Found',
  },
  { status: 404 },
);
