// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;


contract TranscendenceTournamentHistory {
    address public owner;
    uint public numberPlayers;

    //Each player profile
    struct Player {
        string _userName;
        uint _numberVictory;
    }

    //Tab to store all the players informations
    Player[] public players;

    //Contructor to construct the contrat and store the contract owner
    constructor() {
        owner = msg.sender;
        numberPlayers = 0;
    }

    ///////////////////
    //OWNER FUNCTIONS//
    ///////////////////

    //Function to add a player to the players tab
    function addPlayer(string memory userName) private {
        require(msg.sender == owner, "You're not the contract owner");

        if (isPlayerExist(userName) == false) {
            players.push(Player(userName, 0));
            numberPlayers++;
        }
    }

    //Function to add a victory to a user
    function addVictory(string memory userName) public {
        require(msg.sender == owner, "You're not the contract owner");

        if (isPlayerExist(userName) == true) {
            players[getPlayerIndex(userName)]._numberVictory++;
        } else {
            addPlayer(userName);
            players[getPlayerIndex(userName)]._numberVictory++;
        }
    }

    ////////////////////
    //GETTER FUNCTIONS//
    ////////////////////

    //Function to get the total player
    function getNumberPlayer() public view returns (uint) {
        return numberPlayers;
    }

    function getNumberVictoryPlayer(string memory userName) public view returns (uint) {
        if (isPlayerExist(userName) == true) {
            return (players[getPlayerIndex(userName)]._numberVictory);
        }
        return (0);
    }

    //Function that return the tab index of of a player
    function getPlayerIndex(string memory userName) public view returns (uint) {
        for (uint index = 0; index < numberPlayers; index++) {
            if (stringComparaison(players[index]._userName, userName)) {
                return (index);
            }
        }
        return (0);
    }

    ///////////////////
    //UTILS FUNCTIONS//
    ///////////////////

    //Function that return true if the player exist
    function isPlayerExist(string memory userName) public view returns (bool) {
        for (uint i = 0; i < numberPlayers; i++) {
            if (stringComparaison(players[i]._userName, userName)) {
                return (true);
            }
        }
        return (false);
    }

    //Utils function to check is the player is already here
    function stringComparaison(string memory s1, string memory s2) public pure returns (bool) {
        bytes memory b1 = bytes(s1);
        bytes memory b2 = bytes(s2);

        if (b1.length != b2.length) {
            return false;
        }
        for (uint i = 0; i < b1.length; i++) {
            if (b1[i] != b2[i]) {
                return false;
            }
        }
        return true;
    }
}
