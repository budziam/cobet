pragma solidity ^0.8.10;

import "truffle/Assert.sol";
import "../contracts/Tournament.sol";

contract TestTournament {

    uint public initialBalance = 1 ether;

    event test_test(address indexed value);

    function testTournamentGetNumber() public {
        Tournament tournament = new Tournament(1000);
        tournament.participate{value: 1000}();
        emit test_test(msg.sender);
        Assert.equal(tournament.hasParticipant(msg.sender), true, "Let's go bitches");
    }
}