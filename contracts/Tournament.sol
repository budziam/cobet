// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Tournament {

    uint public immutable COMMISSION = 5;
    
    address public dealer;
    uint256 public buyIn;
    mapping(address => bool) public participants;

    // Randomly generated password for users

    constructor(
        uint256 _buyIn
    ) {
        dealer = msg.sender;
        buyIn = _buyIn;
    }

    modifier isDealer {
        require(msg.sender == dealer, "You have to be dealer to evaluate a tournament");
        _;
    }

    modifier isBalanceSufficient {
        require(msg.value == buyIn, "You need to send exact amount");
        _;
    }

    function participate() public payable isBalanceSufficient {
        require(participants[msg.sender] == false, "Can't participate multiple times in the same tournament");
        participants[msg.sender] = true;
    }

    function eval(address payable[] memory ranking) public isDealer {

        require(ranking.length > 0, "Ranking of the user's can't be empty");

        for (uint16 i = 0; i < ranking.length; ++i) {
            require(participants[ranking[i]], "Address has to be one of the participants");
        }

        uint256 pot = address(this).balance;
        pot = pot * (100 - COMMISSION) / 100; 

        for (uint16 position = 0; position < ranking.length; ++position) {
            address payable participant = ranking[position];
            uint share = pot * getPrice(position, ranking.length) / 100;
            participant.transfer(share);
        }

        selfdestruct(payable(dealer));
    }

    // Shouldnt the winner be on the position 0 ? Because it's the first one in the array 
    function getPrice(uint16 position, uint256 numberOfPlayers) public pure returns (uint8) {
        if (numberOfPlayers == 2) {
            if (position == 0) {
                return 100;
            }
        }
        else if (numberOfPlayers <= 10) {
            if (position == 0) {
                return 50;
            }

            if (position == 1) {
                return 30;
            }

            if (position == 2) {
                return 20;
            }
        }
        else if (numberOfPlayers <= 18) {
            if (position == 0) {
                return 40;
            }

            if (position == 1) {
                return 30;
            }

            if (position == 2) {
                return 20;
            }

            if (position == 3) {
                return 10;
            }
        }
        // And more...

        return 0;
    }
}