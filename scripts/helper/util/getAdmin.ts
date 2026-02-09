import type { GetRegistryInfoResponse } from '@openapi-ts/token-metadata-v1';
import sdk from 'src/util/walletSDK';

export default async () => {
  const registryInfo = await fetch(`http://localhost:${process.env.PORT}/registry/metadata/v1/info`, {
    headers: {
      Authorization: `Bearer ${await (await sdk.auth.getAdminToken()).accessToken}`,
    },
  });

  return ((await registryInfo.json()) as GetRegistryInfoResponse).adminId;
};
