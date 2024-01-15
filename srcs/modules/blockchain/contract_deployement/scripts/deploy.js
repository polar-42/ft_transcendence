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
    console.log(contract);

    fs.writeFile('contract_address.txt', contract.address, (err) => {
      if (err) throw err;
    });

    //const dir = path.resolve(
    //  __dirname,
    //  "../artifacts/contracts/HelloWorld.sol/HelloWorld.json"
    //)

    const file = fs.readFileSync("../artifacts/contracts/TranscendenceTournamentHistory.sol/TranscendenceTournamentHistory.json", "utf8")
    const json = JSON.parse(file)
    const abi = json.abi

    console.log('abi =', abi);

    fd.writeFile('abi.abi', abi, (err) => {
      if (err) throw err;
    })
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
