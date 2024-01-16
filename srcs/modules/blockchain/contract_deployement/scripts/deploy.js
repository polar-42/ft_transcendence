// tests/TranscendenceTournamentHistory.scripts.js

const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
    const ContractTranscendenceTournamentHistory = await ethers.getContractFactory('TranscendenceTournamentHistory');
    const owner = await ethers.getSigner();

    console.log("Deploying contracts with the account:", owner.address);

    const contract = await ContractTranscendenceTournamentHistory.deploy();
    await contract.deployed();

    console.log("Address of contract is: ", contract.address);

    fs.writeFile('contract_address.txt', contract.address, (err) => {
      if (err) throw err;
    });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
