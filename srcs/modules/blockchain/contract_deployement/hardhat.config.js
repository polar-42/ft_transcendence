/** @type import('hardhat/config').HardhatUserConfig */
//require('hardhat-ethers');
require("@nomiclabs/hardhat-waffle");

module.exports = {
    solidity: {
      version: "0.8.21",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },
    defaultNetwork: "ganache",
    networks: {
      ganache: {
        url: 'http://' + process.env.IP_NODE + ':8545', // Hardhat Network URL
        chainId: 31337, // Chain ID for Hardhat Network
        accounts: [
          process.env.PRIVATE_KEY,
        ],
      },
      hardhat: {
        chainId: 1337,
        accounts: {
          mnemonic: process.env.MNEMONIC_PHRASE,
        }
      },
      //sepolia: {
      //  url: "https://sepolia.infura.io/v3/" + process.env.INFURA_SEPOLIA_KEY,
      //  accounts: [process.env.SEPOLIA_PRIVATE_KEY]
      //}
    },
    paths: {
      sources: "./contracts",
      tests: "./test",
      cache: "./cache",
      artifacts: "./artifacts",
      scripts: "./scripts"
    },
    mocha: {
      timeout: 1000000
    }
  }
