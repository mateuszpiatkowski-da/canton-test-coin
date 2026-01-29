# Improvements

## Token Standard API

1. make splice/token-standard a publishable package - will ease up the process of importing `.dar` files
2. Bundle `.dar`/`.daml` and `.yaml`/generated `.ts` files together for the token standard API

## Docs

1. ["To learn about the Daml packages, see :brokenref:’DAR files and Daml packages’ in the key concepts section."](https://docs.digitalasset.com/build/3.4/sdlc-howtos/applications/develop/manage-daml-packages.html#how-to-upload-and-query-daml-packages)
2. [Logger must be passed as arg to `.configure()` so it can't be optional](./src/walletSdk.ts) (the absence of logger will produce errors)
