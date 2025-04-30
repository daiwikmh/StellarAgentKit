




# AgentKit - Stellar Liquidity Pool Interface

AgentKit is a powerful interface for interacting with Stellar's liquidity pools, enabling seamless token swapping and liquidity provision.

## Contract Addresses

Stellar testnet contract addresses:

- [CATHCM4CKM3GWADS7HEZXXJE7VADGNLBHMX4I5YOX7B2BCAZJORWY2G3](https://stellar.expert/explorer/testnet/contract/CATHCM4CKM3GWADS7HEZXXJE7VADGNLBHMX4I5YOX7B2BCAZJORWY2G3)
- [CBEOGTBVUZCKZZZAKRGS5PENRYCVKNOVIEIPIHFJZZUR3MPTLVR2DGZZ](https://stellar.expert/explorer/testnet/contract/CBEOGTBVUZCKZZZAKRGS5PENRYCVKNOVIEIPIHFJZZUR3MPTLVR2DGZZ)
- [CD7DKD3YCCHLNWS7WKQI6JL6EMMRS2PEXTZBV33FODSO6IKFYEPP3O2M](https://stellar.expert/explorer/testnet/contract/CD7DKD3YCCHLNWS7WKQI6JL6EMMRS2PEXTZBV33FODSO6IKFYEPP3O2M)

## Pool Information

Current pool configuration:

```
Pool Address: CCUMBJFVC3YJOW3OOR6WTWTESH473ZSXQEGYPQDWXAYYC4J77OT4NVHJ
Token A: CCG563JGXCXLADE7I3YCOUEF5BVMY7ONU7WZZTXF7SYL5YHSYDTGE4TW
Token B: CCTJJCPL236LCFKW7AMZI4YA5RDYZXABHVVVNBM5YIUKND7HU
New Pool Address: CDCYNBDMTHAPYMAU4IJ2DPMACOWDQVZ3TXLYAF7K2V2LBVBU22K2YRNZ
```

## Dependencies

### stellartools Package

The [stellartools](https://www.npmjs.com/package/stellartools) package provides a comprehensive set of utilities for interacting with the Stellar blockchain:

#### Key Features

- **Contract Interactions**
  - Type-safe contract invocation
  - Automated ABI handling
  - Event listening and subscription
  - Contract state management

- **Transaction Management**
  - Simplified transaction building
  - Multi-signature support
  - Transaction status tracking
  - Fee estimation and management

- **Pool Operations**
  - Liquidity deposit/withdrawal
  - Token swap execution
  - Pool metrics calculation
  - Price impact estimation

- **Token Operations**
  - Token balance checking
  - Transfer operations
  - Allowance management
  - Token metadata retrieval

#### Usage Examples

```javascript
// Initialize contract instance
const contract = await stellartools.initContract(contractAddress);

// Execute token swap
const swap = await contract.swap({
  tokenIn: tokenAAddress,
  tokenOut: tokenBAddress,
  amountIn: "1000000",
  minAmountOut: "990000"
});

// Add liquidity
const deposit = await contract.addLiquidity({
  tokenA: tokenAAddress,
  tokenB: tokenBAddress,
  amountA: "1000000",
  amountB: "1000000"
});
```

## Project Structure

- `/agent` - Backend service handling AI-powered interactions
- `/liquid` - Frontend interface for liquidity pool operations
  - React/Vite-based UI
  - Stake package integration
  - Modern component architecture

## Getting Started

1. Install dependencies:
   ```bash
   # In the agent directory
   npm install

   # In the liquid directory
   pnpm install
   ```

2. Start the development servers:
   ```bash
   # Start the agent backend
   cd agent
   npm start

   # Start the liquid frontend
   cd liquid
   pnpm dev
   ```

## Features

- Real-time liquidity pool management
- Token swapping interface
- AI-powered trading assistance
- Stake package integration for advanced operations
- Modern, responsive UI built with React and Vite

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
