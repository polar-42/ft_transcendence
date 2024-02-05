// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;


contract TranscendenceTournamentHistory {
    address public owner;
    uint public numberTournament;

    //Each player profile
    struct Tournament {
        string _winnerId;
        string _tournamentId;
    }

    //Tab to store all the players informations
    Tournament[] public tournaments;

    //Contructor to construct the contrat and store the contract owner
    constructor() {
        owner = msg.sender;
        numberTournament = 0;
    }

    ///////////////////
    //OWNER FUNCTIONS//
    ///////////////////

    //Function to add a player to the players tab
    function addTournament(string memory winnerId, string memory tournamentId) public {
        require(msg.sender == owner, "You're not the contract owner");

        if (isTournamentAlreadyStore(tournamentId) == false) {
            tournaments.push(Tournament(winnerId, tournamentId));
            numberTournament++;
        }
    }

    ////////////////////
    //GETTER FUNCTIONS//
    ////////////////////

    //Function to get the total player
    function getNumberTournament() public view returns (uint) {
        return numberTournament;
    }

    //Function to get total victory in tournament for userId
    function getNumberVictoryPlayer(string memory userId) public view returns (uint) {
        uint numberVictory = 0;
        for (uint index = 0; index < numberTournament; index++) {
            if (stringComparaison(tournaments[index]._winnerId, userId) == true) {
                numberVictory++;
            }
        }
        return (numberVictory);
    }

    //Function that return the winnerId of the tournamentId
    function getWinnerTournament(string memory tournamentId) public view returns (string memory) {
        for (uint index = 0; index < numberTournament; index++) {
            if (stringComparaison(tournaments[index]._tournamentId, tournamentId) == true) {
                return (tournaments[index]._tournamentId);
            }
        }
        return ("NULL");
    }

    ///////////////////
    //UTILS FUNCTIONS//
    ///////////////////

    //Function that return true if the player exist
    function isTournamentAlreadyStore(string memory tournamentId) public view returns (bool) {
        for (uint index = 0; index < numberTournament; index++) {
            if (stringComparaison(tournaments[index]._tournamentId, tournamentId) == true) {
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
