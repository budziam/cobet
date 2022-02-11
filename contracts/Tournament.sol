// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Tournament {

    enum State { Ongoing, BetsClosed, Failed, PaidOut }

    uint public immutable COMMISSION = 5;
    
    address public dealer;
    uint256 public buyIn;
    uint256 public id;
    State public state;
    mapping(address => bool) public participants;

    // Randomly generated password for users

    constructor(
        uint256 _id,
        uint256 _buyIn
    ) {
        dealer = msg.sender;
        id = _id;
        buyIn = _buyIn;
        state = State.Ongoing;
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
        participants[msg.sender] = true;
    }

    function eval(address payable[] memory ranking) public isDealer {
        for (uint16 i = 0; i < ranking.length; ++i) {
            require(participants[ranking[i]], "Address has to be one of the participants");
        }

        uint256 pot = address(this).balance;
        pot *= (100 - COMMISSION) / 100; 

        for (uint16 position = 0; position < ranking.length; ++position) {
            address payable participant = ranking[position];
            uint share = pot * getPrice(position, ranking.length) / 100;
            participant.transfer(share);
        }

        selfdestruct(payable(dealer));
    }

    function getPrice(uint16 position, uint256 numberOfPlayers) public pure returns (uint8) {
        if (numberOfPlayers == 2) {
            if (position == 1) {
                return 100;
            }
        }
        else if (numberOfPlayers <= 10) {
            if (position == 1) {
                return 50;
            }

            if (position == 2) {
                return 30;
            }

            if (position == 3) {
                return 20;
            }
        }
        else if (numberOfPlayers <= 18) {
            if (position == 1) {
                return 40;
            }

            if (position == 2) {
                return 30;
            }

            if (position == 3) {
                return 20;
            }

            if (position == 4) {
                return 10;
            }
        }
        // And more...

        return 0;
    }
}