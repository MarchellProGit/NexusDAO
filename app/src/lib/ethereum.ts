import { ethers } from 'ethers';

// Ganti ini dengan address contract yang didapat dari Langkah 5 TR
export const CONTRACT_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; 

// Private Keys bawaan Anvil untuk simulasi multi-user (Wallet Switcher)
export const ACCOUNTS = [
  { name: "Admin (Account 1)", key: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" },
  { name: "User (Account 2)", key: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
  { name: "User (Account 3)", key: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" }
];

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

export const getProvider = () => {
  return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
};

export const getSigner = (privateKey: string) => {
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
};

export const getContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, NexusDAOABI, signerOrProvider);
};
