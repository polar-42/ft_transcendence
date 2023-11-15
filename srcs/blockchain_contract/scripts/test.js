const { ethers } = require('hardhat');

const abi = [
	"function getNumberPlayer() public view returns (uint)",
	"function getNumberVictoryPlayer(string memory userName) public view returns (uint)",
	"function addPlayer(string memory userName) public"
]

async function main() {
	const signer = await ethers.getSigner();
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer);

	console.log("Launching getData script");
    console.log("Address of contract is:", contract.address);
	console.log("Number of player is:", await contract.getNumberPlayer());

	const tx = await contract.addPlayer("test");

	console.log("Number of player is:", await contract.getNumberPlayer());
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
