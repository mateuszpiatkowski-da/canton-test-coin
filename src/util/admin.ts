import type { KeyPair } from '@canton-network/core-signing-lib';

export default {
  partyId: '',
  keyPair: {
    publicKey: process.env.ADMIN_PUBLIC_KEY ?? '',
    privateKey: process.env.ADMIN_PRIVATE_KEY ?? '',
  } satisfies KeyPair,
};
