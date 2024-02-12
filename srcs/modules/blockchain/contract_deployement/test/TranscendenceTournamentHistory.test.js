// tests/TranscendenceTournamentHistory.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('TranscendenceTournamentHistory', function () {
  it('Test the addPlayer and addVictory functions', async function () {
    const ContractTranscendenceTournamentHistory = await ethers.getContractFactory('TranscendenceTournamentHistory');
    const owner = await ethers.getSigner();

    const contract = await ContractTranscendenceTournamentHistory.deploy();
    await contract.deployed();

    // console.log('Current size of players:', await contract.getNumberPlayer());

    const tx = await contract.addPlayer('PlayerOne');
    await tx.wait();

    const tx2 = await contract.addVictory('PlayerOne');
    await tx2.wait();

    // console.log('Current size after change:', await contract.getNumberPlayer());
    // console.log('Current victory of PlayerOne:', await contract.getNumberVictoryPlayer('PlayerOne'));

    const nVicory1 = await contract.getNumberVictoryPlayer('PlayerOne');
    expect(nVicory1).to.equal(1);
  });

  it('Test the owner contract', async function () {
    const ContractTranscendenceTournamentHistory = await ethers.getContractFactory('TranscendenceTournamentHistory');
    const [owner, notOwner] = await ethers.getSigners();

    const contract = await ContractTranscendenceTournamentHistory.connect(owner).deploy();
    await contract.deployed();

    try {
      const tx = await contract.connect(notOwner).addVictory('PlayerOne');
      await tx.wait();
    } catch (error) {
      const errorMEssage = "You're not the contract owner";
      expect(error.message).to.include(errorMEssage);
    }
  });
});
