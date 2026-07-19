import { ethers } from 'ethers';

// Ganti ini dengan address contract yang didapat dari Langkah 5 TR
export const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 

// Private Key bawaan Anvil (Akun #0)
// HANYA UNTUK KEPERLUAN DEMO LOKAL TUGAS RANCANG!
const ANVIL_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export const NexusDAOABI = [
  "function proposalCount() view returns (uint256)",
  "function proposals(uint256) view returns (uint256 id, string title, string description, uint256 votesFor, uint256 votesAgainst, bool active)",
  "function hasVoted(address, uint256) view returns (bool)",
  "function createProposal(string memory _title, string memory _description)",
  "function castVote(uint256 _proposalId, bool _support)",
  "function closeProposal(uint256 _proposalId)",
  "function getProposal(uint256 _proposalId) view returns (uint256 id, string title, string description, uint256 votesFor, uint256 votesAgainst, bool active)",
  "event ProposalCreated(uint256 id, string title, string description)",
  "event Voted(uint256 indexed proposalId, address indexed voter, bool support)",
  "event ProposalClosed(uint256 id)"
];

export const getProvider = () => {
  return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
};

export const getSigner = () => {
  const provider = getProvider();
  return new ethers.Wallet(ANVIL_PRIVATE_KEY, provider);
};

export const getContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, NexusDAOABI, signerOrProvider);
};
