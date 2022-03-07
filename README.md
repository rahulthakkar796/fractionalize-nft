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
