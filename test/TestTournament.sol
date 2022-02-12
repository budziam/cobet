pragma solidity ^0.8.10;

import "truffle/Assert.sol";
import "../contracts/Tournament.sol";

contract TestTournament {
    uint public initialBalance = 1 ether;

    function testTournamentGetNumber() public {
        Tournament tournament = new Tournament(1000);
        tournament.participate{value: 1000}();
        Assert.equal(tournament.participants(address(this)), true, "Participant is not registered");
    }


}