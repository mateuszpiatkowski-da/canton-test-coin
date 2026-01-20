import client from 'src/tokenStandardClient';

export default async (req: Request) => {
  const path = new URL(req.url).pathname;
  return client.get(path);
};
