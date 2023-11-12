/** @type import('hardhat/config').HardhatUserConfig */
//require('hardhat-ethers');
require("@nomiclabs/hardhat-waffle");

module.exports = {
    defaultNetwork: "localhost",
    networks: {
      hardhat: {},
      localhost: {
        url: 'http://localhost:8545',
        chainId: 31337,
        accounts: [
          process.env.ACCOUNT1,
          process.env.ACCOUNT2,
        ],
      },
    },
  }
  

//first address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
//second address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
