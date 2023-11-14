const { ethers } = window;

const abi = [
	"function getNumberPlayer() public view returns (uint)",
	"function getNumberVictoryPlayer(string memory userName) public view returns (uint)"
]


const provider = new ethers.providers.JsonRpcProvider("http://IPADDRESS:8545");
const contract = new ethers.Contract("CONTRACTADDRESS", abi, provider);

async function getNPlayer()
{
	let val = await contract.getNumberPlayer();
	console.log("val = ", val);
	document.getElementById("nPlayer").innerText = val;
}

getNPlayer();
