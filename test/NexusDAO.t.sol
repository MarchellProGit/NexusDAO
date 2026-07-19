// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {NexusDAO} from "../src/NexusDAO.sol";

contract NexusDAOTest is Test {
    NexusDAO public dao;
    address public user1 = address(1);
    address public user2 = address(2);

    function setUp() public {
        dao = new NexusDAO();
    }

    function testCreateProposal() public {
        dao.createProposal("Fund Project X", "We need 10 ETH for marketing");
        assertEq(dao.proposalCount(), 1);
        
        (uint256 id, string memory title, string memory desc, uint256 forVotes, uint256 againstVotes, bool active) = dao.getProposal(1);
        assertEq(id, 1);
        assertEq(title, "Fund Project X");
        assertEq(desc, "We need 10 ETH for marketing");
        assertEq(forVotes, 0);
        assertEq(againstVotes, 0);
        assertTrue(active);
    }

    function testCastVote() public {
        dao.createProposal("Proposal 1", "Description");
        
        vm.prank(user1);
        dao.castVote(1, true); // Vote FOR

        vm.prank(user2);
        dao.castVote(1, false); // Vote AGAINST

        (,,,, uint256 againstVotes, ) = dao.getProposal(1);
        assertEq(againstVotes, 1);
    }

    function testCannotVoteTwice() public {
        dao.createProposal("Proposal 1", "Description");
        
        vm.prank(user1);
        dao.castVote(1, true);

        vm.expectRevert("Already voted on this proposal");
        vm.prank(user1);
        dao.castVote(1, true);
    }

    function testCloseProposal() public {
        dao.createProposal("Proposal 1", "Description");
        dao.closeProposal(1);
        
        vm.expectRevert("Proposal is closed");
        vm.prank(user1);
        dao.castVote(1, true);
    }
}
