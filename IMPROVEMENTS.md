# Improvements

## Token Standard API

1. make splice/token-standard a publishable package - will ease up the process of importing `.dar` files
2. Bundle `.dar`/`.daml` and `.yaml`/generated `.ts` files together for the token standard API

## Docs

1. ["To learn about the Daml packages, see :brokenref:'DAR files and Daml packages' in the key concepts section."](https://docs.digitalasset.com/build/3.4/sdlc-howtos/applications/develop/manage-daml-packages.html#how-to-upload-and-query-daml-packages)
2. [Logger must be passed as arg to `.configure()` so it can't be optional](./src/walletSdk.ts) (the absence of logger will produce errors)
3. Merge changes from `mateuszpiatkowski-da/canton-test-coin` branch in splice-wallet-kernel into main branch (includes multi-signature support for `executeSubmission` methods)
4. Currently `@canton-network/core-token-standard` uses `openapi typegen` to generate ts files for frontend clients. However, it should also propagate files for backend using `openapi typegen --backend` (see more about [typegen for backend](https://openapistack.co/docs/openapicmd/intro/#openapi-typegen-definition)).
