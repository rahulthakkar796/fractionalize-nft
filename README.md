## Installation

Use the node package manager [npm](https://docs.npmjs.com/cli/v8/commands/npm-install) to install dependencies.

```bash
npm install
```

## Usage

Compile contracts:

```bash
npm run compile
```

Deploy contracts

```bash
npm run deploy
```

Run tests

```bash
npm run test
```

Run demo on local hardhat node

```bash
npx hardhat run scripts/demo/demo.js
```

Run demo on local polygon edge node

```bash
npx hardhat run scripts/demo/demo.js --network edge
```

Start hardhat node for the external use

```bash
npm run node
```
---
## Polygon edge 
**ENV variables**
- ACCOUNT: Account address to initialize with the pre-mined amount of tokens in the genesis file
- AMOUNT: Amount of tokens you want to premine to the `ACCOUNT`, Value must be in 18 decimals, so for example: `100 ETH = 100000000000000000000`

**Usage**
Build the services
```bash
docker-compose build --no-cache
```
Start the services
```bash
docker-compose up --force-recreate
```

# Common problems
Here is a list of common problems you might encounter while using dockerized polygon edge network
- **Peers don't connect with each other:**
    - Make sure you have established a stable connection between all the nodes, check the networking in the [`docker-compose.yml`](/docker-compose.yml)
- **Peers connect, but the transaction doesn't go through:**
    - Make sure you have generated [`genesis.json`](/docker/genesis.json) correctly. This issue is related to the configuration of the polygon-edge network. Ensure your configuration in [`entrypoint.sh`](/docker/entrypoint.sh).

