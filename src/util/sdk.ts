import { localNetStaticConfig, SDK } from '@canton-network/wallet-sdk';

const sdk = await SDK.create({
  auth: {
    method: 'self_signed',
    issuer: 'unsafe-auth',
    credentials: {
      clientId: localNetStaticConfig.LOCALNET_USER_ID,
      clientSecret: 'unsafe',
      audience: 'https://canton.network.global',
      scope: '',
    },
  },
  ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
});

export default sdk;
