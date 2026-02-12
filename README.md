# Canton Test Coin

A reference implementation and testing suite for the Splice Token Standard using DAML smart contracts, Canton network, and TypeScript.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Execution](#execution)
- [Using This Project as a Template](#using-this-project-as-a-template)
- [Development](#development)
- [Reporting Issues](#reporting-issues)

## Overview

Canton Test Coin is a comprehensive test implementation demonstrating how to build a complete token system on the Canton network using the Splice Token Standard. It provides a working example of:

- **Token Metadata**: Manage token information and properties
- **Token Allocation**: Handle token allocation requests and track allocations
- **Token Transfer**: Execute secure token transfers between holders
- **REST API**: OpenAPI-compliant REST endpoints for all operations
- **Smart Contract Layer**: DAML-based smart contracts for token logic

This project combines:

- **DAML** (Digital Asset Modeling Language) for smart contract logic
- **Canton Network** for distributed ledger consensus
- **TypeScript/Bun** for the backend REST API
- **Splice SDK** for wallet integration and ledger communication

## Project Structure

```plaintext
canton-test-coin/
├── daml/                              # DAML smart contracts
│   ├── daml.yaml                      # DAML configuration
│   ├── src/
│   │   └── Coin/                      # Token implementation modules
│   ├── test/                          # Test DAML code and fixtures
│   │   ├── Index.daml                 # Core test templates
│   │   ├── Transfer.daml              # Token transfer tests
│   │   ├── Allocation/                # Allocation-related tests
│   │   ├── Fixture/                   # Test fixtures and setup
│   │   └── Util/                      # Test utilities
│   └── token-standard-api/            # Splice Token Standard API dependencies
├── src/                               # TypeScript backend application
│   ├── index.ts                       # Application entry point
│   ├── routes.ts                      # API route definitions
│   ├── api/                           # API endpoint handlers
│   │   ├── metadata/                  # Metadata endpoints
│   │   ├── transfer-instruction/      # Transfer orchestration
│   │   ├── allocation-instruction/    # Allocation operations
│   │   ├── allocation/                # Allocation queries
│   │   └── error.ts                   # Error handling utilities
│   ├── types/                         # TypeScript type definitions
│   │   ├── daml-ts/                   # Generated DAML TypeScript bindings
│   │   └── openapi-ts/                # Generated OpenAPI client types
│   └── util/                          # Utility functions
│       ├── logger.ts                  # Logging setup
│       ├── init.ts                    # Application initialization
│       ├── walletSDK.ts               # Splice Wallet SDK configuration
│       └── ...                        # Other utilities
├── scripts/                           # Utility scripts
│   ├── generateOpenapi.ts             # Generate OpenAPI types
│   └── helper/                        # Helper scripts for manual operations
│       ├── createTransferInstruction.ts
│       ├── createAllocationInstruction.ts
│       └── createAllocation.ts
├── splice/                            # Splice reference and submodule
├── splice-wallet-kernel/              # Wallet SDK reference (monorepo)
├── package.json                       # Node.js dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
└── IMPROVEMENTS.md                    # Future improvements and notes
```

### Directory Descriptions

| Directory               | Purpose                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `daml/`                 | DAML smart contracts defining token templates, transfer logic, and allocation mechanisms |
| `src/api/`              | Bun route handlers implementing the OpenAPI specification                                |
| `src/types/`            | Generated TypeScript types from DAML and OpenAPI specs                                   |
| `src/util/`             | Shared utilities: logger, SDK configuration, initialization routines                     |
| `scripts/`              | One-off scripts for code generation and manual contract operations                       |
| `splice/`               | Git submodule containing Splice framework reference code                                 |
| `splice-wallet-kernel/` | Git submodule containing Splice Wallet Kernel framework reference code                   |

## Prerequisites

Before installing and running this project, ensure you have the following:

**Required Software**

- **Bun** (v1.2.19+) as runtime
  - <https://bun.com/docs/installation>
  - Verify: `bun --version`
- **DAML SDK**: Version 3.4.9 or compatible
  - Installation: <https://docs.daml.com/getting-started/installation.html>
  - Set SDK version: `daml use 3.4.9`
  - Verify: `daml version`
- **Canton Network**: Running instance accessible at configured endpoint
  - Installation: see `start:localnet` command in <https://github.com/hyperledger-labs/splice-wallet-kernel/blob/main/package.json>
  - See [Development](#development) section for local setup

**Access & Credentials**

- **Canton Admin Credentials**: Public/private key pair for signing transactions
- **Ledger Access**: Permission to submit and read from the connected Canton ledger
- Configure via environment variables (see [Installation](#installation))

## Installation

### Step 1: Initialize Git Submodules

This project includes Splice framework code as submodules:

```bash
git submodule update --init --recursive
```

### Step 2: Install Dependencies

```bash
bun install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```dotenv
# Server port
PORT=3001

# Canton admin authentication
ADMIN_PUBLIC_KEY=<your-admin-public-key>
ADMIN_PRIVATE_KEY=<your-admin-private-key>
```

**Where to get credentials?**

You can search for and use `createKeyPair()` method in `@canton-network/wallet-sdk` project or create public/private key yourself based on any cryptographic algorithm.

### Step 4: Full Clean Build

To do a complete rebuild from scratch:

```bash
bun generate:all
```

This runs all code generation steps in sequence and does the following:

- Cleans previous builds
- Compiles main token contracts in `daml/`
- Compiles token standard API in `daml/token-standard-api/`
- Compiles test templates in `daml/test/` for verification purposes
- Generates:
  - JavaScript/TypeScript bindings for all DAML templates
  - Type definitions matching your contract structure
  - Type-safe client classes corresponding to API endpoints based on OpenAPI specification

## Execution

### Starting the Server

Once installation is complete, start the application:

```bash
bun dev
```

Expected output:

```
Server running at http://localhost:3001
```

The server will:

1. Load Splice Wallet SDK configuration
2. Authenticate with Canton network
3. Initialize token templates
4. Start HTTP server on configured port

### Making API Requests

After the server starts, you can interact with the token system. All API requests require bearer token authentication. Include the `Authorization` header with your bearer token in each request:

#### Examples

##### List Token Metadata

```bash
curl -H "Authorization: Bearer <your-bearer-token>" \
  http://localhost:3001/registry/metadata/v1
```

##### Create a Transfer Instruction

```bash
curl -X POST http://localhost:3001/registry/transfer-instruction/v1 \
  -H "Authorization: Bearer <your-bearer-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "<holder-party-id>",
    "to": "<recipient-party-id>",
    "amount": 1000
  }'
```

You can find the rest of the API endpoints in `src/routes.ts` or in the [Token Standard API Specs](https://github.com/hyperledger-labs/splice/tree/main/token-standard/README.md).

### Helper Scripts

For manual contract operations without the REST API, you can use helper scripts defined in `scripts/helper/`. All helper scripts are available via package.json scripts and use the `helper:` prefix. Their purpose is to obtain the id of contracts to pass as input when testing the API endpoints.

#### `helper:createAllocation`

Creates a new token allocation on the ledger.

```bash
bun helper:createAllocation
```

#### `helper:createAllocationInstruction`

Creates an allocation instruction for token distribution.

```bash
bun helper:createAllocationInstruction
```

#### `helper:createTransferInstruction`

Creates a transfer instruction to move tokens between holders.

```bash
bun helper:createTransferInstruction
```

## Using This Project as a Template

### To Create a New Token System

1. **Fork or Clone**: Use this repository as a starting point

   ```bash
   git clone https://github.com/mateuszpiatkowski-da/canton-test-coin.git my-token
   ```

2. **Customize DAML Contracts**:
   - Modify token logic in `daml/src/Coin/`
   - Define your own token templates and choices
   - Update test fixtures in `daml/test/`
   - Rebuild with `bun daml:rebuild`

3. **Extend API Handlers**:
   - Add new endpoints in `src/api/`
   - Implement handlers matching your token logic
   - Export routes from `src/routes.ts`

4. **Update Configuration**:
   - Modify `.env` for your setup
   - Configure ledger connection details
   - Set up your admin credentials

5. **Regenerate Types**:
   - Run `bun generate:all` after DAML changes
   - Commit generated types for reproducibility

6. **Test Thoroughly**:
   - Add test cases in `daml/test/`
   - Run ledger integration tests
   - Verify HTTP endpoints with `curl` or Postman |

## Development

### Development Workflow

1. Make changes to DAML contracts or TypeScript code
2. Rebuild affected components:

   ```bash
   bun daml:rebuild      # After DAML changes
   bun generate:daml-ts  # After DAML schema changes
   bun dev               # Start development server with hot reload
   ```

3. Test against your Canton instance
4. Repeat until desired behavior achieved

### Running Tests

DAML contracts include comprehensive test fixtures. To test them:

```bash
# Build test contracts
cd daml/test
daml build

# Run specific test template
daml script --dar .daml/dist/test-coin-test-1.0.0.dar --script-name <TestName>
```

### Local Canton Setup

Start the local Canton network using the `splice-wallet-kernel` helper:

```bash
# from the project root
cd splice-wallet-kernel
yarn start:localhost
```

This command starts Canton and related services used by the wallet kernel. Wait for services to report healthy in the logs before proceeding.

Refer to [splice-wallet-kernel](./splice-wallet-kernel/README.md) repo for details.

## Reporting Issues

TBD

## License

TBD

## Additional Resources

- [DAML Documentation](https://docs.digitalasset.com/build/3.4/tutorials/smart-contracts/intro.html)
- [Canton Documentation](https://docs.digitalasset.com/build/3.4/tutorials/json-api/canton_and_the_json_ledger_api.html)
- [Splice Framework](https://github.com/hyperledger-labs/splice)
- [Token Standard API](./daml/token-standard-api/README.md)
- [Development Guide](./IMPROVEMENTS.md)

---

**Last Updated**: February 2026
**DAML SDK Version**: 3.4.9+
**Bun**: 1.2.19+
