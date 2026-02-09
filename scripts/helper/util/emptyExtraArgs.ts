import type { ExtraArgs } from '@daml-ts/splice-api-token-1.0.0/lib/Splice/Api/Token/MetadataV1';
import emptyMeta from './emptyMeta';

export default {
  context: {
    values: {},
  },
  meta: emptyMeta,
} satisfies ExtraArgs;
