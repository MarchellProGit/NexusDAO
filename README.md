# NexusDAO

NexusDAO is a decentralized governance platform (Decentralized Autonomous Organization) built on the Ethereum blockchain. This project was developed as a comprehensive technical implementation of a full CRUD (Create, Read, Update, Delete) Smart Contract architecture paired with a modern React-based Web3 interface.

<div align="center">
  <img src="https://img.shields.io/badge/Solidity-%23363636.svg?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
  <img src="https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Foundry-%23FF5E00.svg?style=for-the-badge" alt="Foundry" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Framer_Motion-%230055FF.svg?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</div>

---

## Technical Specifications

### 1. Smart Contract Architecture (Full CRUD)
The `NexusDAO.sol` contract implements comprehensive state management functionalities on the Ethereum Virtual Machine (EVM):
*   **Create**: `createProposal` - Registers a new governance proposal into the blockchain state.
*   **Read**: `getProposal` - A view function to query live data from the network without incurring gas fees.
*   **Update**: `castVote` & `closeProposal` - Mutates existing state to record votes and finalize proposal statuses. Emits `Voted` and `ProposalClosed` events respectively.
*   **Delete**: `deleteProposal` - Removes the proposal data from the EVM storage, optimizing contract state size and emitting a `ProposalDeleted` event.

### 2. Web3 Integration & Multi-Account Simulation
*   The application implements a built-in wallet switcher, allowing users to simulate multi-user interactions on a local network.
*   Demonstrates identity-based security (`msg.sender` validation) to ensure cryptographic constraints, such as one-vote-per-wallet policies.
*   Utilizes `ethers.js` event listeners for real-time state synchronization between the blockchain and the client interface without requiring manual page refreshes.

### 3. User Interface
*   Designed using Tailwind CSS and Framer Motion for a responsive and modern user experience.
*   Features a "System Documentation" modal that dynamically reflects real-time transaction hashes and gas consumption metrics directly mapped from the EVM execution receipts.

---

## Engineering Team

- **Marchell Adi Pratama** (672023081) - Lead Blockchain Engineer & UI/UX Architect.
- **Nova Hendriyawan Putra** (672023113) - Smart Contract QA & Research Analyst.

---

## Deployment and Installation Guide

### Prerequisites
- [Node.js (v18+)](https://nodejs.org/)
- [Foundry (Forge, Anvil, Cast)](https://book.getfoundry.sh/getting-started/installation)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
Begin by cloning the project repository to your local machine:
```bash
git clone https://github.com/MarchellProGit/NexusDAO.git
cd NexusDAO
```

### 2. Initialize Local Blockchain Node
Open a terminal and start the local Anvil node (which simulates the Ethereum network):
```bash
anvil
```

### 3. Deploy the Smart Contract
In a separate terminal, deploy the `NexusDAO` contract to the local network using Forge:
```bash
forge create src/NexusDAO.sol:NexusDAO --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```
*Note: Copy the deployed contract address from the terminal output (e.g., `Deployed to: 0x...`).*

### 4. Configure and Run the Client Interface
Navigate to the frontend application directory, update the configuration, and launch the development server:
```bash
cd app
```
*   Open the file `src/lib/ethereum.ts` in your code editor.
*   Update the `CONTRACT_ADDRESS` constant with the address generated in Step 3.
*   Install dependencies and start the application:
```bash
npm install
npm run dev
```

### 5. Application Access
Access the application at `http://localhost:5173/` or `http://localhost:5174/` (depending on the port assigned by Vite). Click the "System Documentation" menu in the header for a detailed breakdown of the technical specifications and real-time execution logs.
