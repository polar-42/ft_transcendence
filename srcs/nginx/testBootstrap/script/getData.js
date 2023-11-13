import { ethers } from "./ethers.js";

const abi = [
	"function getNumberPlayer() public view returns (uint)",
	"function getNumberVictoryPlayer(string memory userName) public view returns (uint)"
]

//async function main() {
//	const signer = await ethers.getSigner();
//    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer);

//	console.log("Launching getData script");
//    console.log("Address of contract is:", contract.address);
//	val = await contract.getNumberPlayer();
//	console.log("Number of player is:", val);
//};


//const signer = await ethers.getSigner();
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer);

function getNPlayer()
{
	let val = contract.getNPlayer();
	document.getElementById("nPlayer").innerText = val;
}

getNPlayer();

console.log("test");
