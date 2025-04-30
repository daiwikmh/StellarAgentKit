




# AgentKit - Stellar Liquidity Pool Interface

AgentKit is a powerful interface for interacting with Stellar's liquidity pools, enabling seamless token swapping and liquidity provision.

## Pool Information

Current pool configuration:

```
Pool Address: CCUMBJFVC3YJOW3OOR6WTWTESH473ZSXQEGYPQDWXAYYC4J77OT4NVHJ
Token A: CCG563JGXCXLADE7I3YCOUEF5BVMY7ONU7WZZTXF7SYL5YHSYDTGE4TW
Token B: CCTJJCPL236LCFKW7AMZI4YA5RDYZXABHVVVNBM5YIUKND7HU
New Pool Address: CDCYNBDMTHAPYMAU4IJ2DPMACOWDQVZ3TXLYAF7K2V2LBVBU22K2YRNZ
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