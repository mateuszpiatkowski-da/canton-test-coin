import { TokenStandardClient } from '@canton-network/core-token-standard';
import { localNetStaticConfig } from '@canton-network/wallet-sdk';
import { generateAccessToken } from './auth';
import { createLogger } from './logger';

const logger = createLogger({ name: 'TokenStandardClient' });
const registryUrl = import.meta.env.REGISTRY_URL || localNetStaticConfig.LOCALNET_REGISTRY_API_URL.href;
const accessToken = await generateAccessToken();

const client = new TokenStandardClient(registryUrl, logger, false, accessToken);

export default client;
