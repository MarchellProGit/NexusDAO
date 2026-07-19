import { ethers } from 'ethers';

/**
 * NexusDAO Smart Contract Address
 * Target Network: Local Localhost (Anvil)
 */
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

/**
 * Pre-funded accounts provided by the local Anvil node.
 * Used for local multi-user testing and identity switching.
 */
export const ACCOUNTS = [
  { name: "Pak TIB (Admin)", key: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" },
  { name: "Marchell", key: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
  { name: "Nova", key: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" }
];

/**
 * Contract Application Binary Interface (ABI)
 */
export const NexusDAOABI = [
  "function proposalCount() view returns (uint256)",
  "function proposals(uint256) view returns (uint256 id, string title, string description, uint256 votesFor, uint256 votesAgainst, bool active)",
  "function hasVoted(address, uint256) view returns (bool)",
  "function createProposal(string memory _title, string memory _description)",
  "function castVote(uint256 _proposalId, bool _support)",
  "function closeProposal(uint256 _proposalId)",
  "function deleteProposal(uint256 _proposalId)",
  "function getProposal(uint256 _proposalId) view returns (uint256 id, string title, string description, uint256 votesFor, uint256 votesAgainst, bool active)",
  "event ProposalCreated(uint256 id, string title, string description)",
  "event Voted(uint256 indexed proposalId, address indexed voter, bool support)",
  "event ProposalClosed(uint256 id)",
  "event ProposalDeleted(uint256 id)"
];

/**
 * Initializes the JSON-RPC provider for local Ethereum node.
 */
export const getProvider = () => {
  return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
};

/**
 * Constructs a secure Wallet instance capable of signing transactions.
 * @param privateKey The hex-encoded private key.
 */
export const getSigner = (privateKey: string) => {
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
};

/**
 * Instantiates the read/write NexusDAO contract interface.
 * @param signerOrProvider Connection layer (Signer for writes, Provider for reads).
 */
export const getContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, NexusDAOABI, signerOrProvider);
};
