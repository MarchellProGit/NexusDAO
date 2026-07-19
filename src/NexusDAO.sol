// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NexusDAO {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        bool active;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    event ProposalCreated(uint256 id, string title, string description);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalClosed(uint256 id);
    event ProposalDeleted(uint256 id);

    // WRITE 1: Create Proposal
    function createProposal(string memory _title, string memory _description) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            title: _title,
            description: _description,
            votesFor: 0,
            votesAgainst: 0,
            active: true
        });

        emit ProposalCreated(proposalCount, _title, _description);
    }

    // WRITE 2: Cast Vote
    function castVote(uint256 _proposalId, bool _support) public {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        require(proposals[_proposalId].active, "Proposal is closed");
        require(!hasVoted[msg.sender][_proposalId], "Already voted on this proposal");

        hasVoted[msg.sender][_proposalId] = true;

        if (_support) {
            proposals[_proposalId].votesFor++;
        } else {
            proposals[_proposalId].votesAgainst++;
        }

        emit Voted(_proposalId, msg.sender, _support);
    }

    // WRITE 3: Close Proposal
    function closeProposal(uint256 _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        require(proposals[_proposalId].active, "Proposal is already closed");
        
        // In a real DAO, only the creator or an admin would do this, or time-based.
        // For TR simplicity, anyone can close it.
        proposals[_proposalId].active = false;
        
        emit ProposalClosed(_proposalId);
    }

    // WRITE 4: Delete Proposal
    function deleteProposal(uint256 _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        require(bytes(proposals[_proposalId].title).length > 0, "Proposal already deleted");
        
        delete proposals[_proposalId];
        
        emit ProposalDeleted(_proposalId);
    }

    // READ 1: Get Proposal
    function getProposal(uint256 _proposalId) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        bool active
    ) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage p = proposals[_proposalId];
        return (p.id, p.title, p.description, p.votesFor, p.votesAgainst, p.active);
    }
}
