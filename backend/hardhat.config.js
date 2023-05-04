require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();
const private_key = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "theta_testnet",
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    theta_mainnet: {
      url: `https://eth-rpc-api.thetatoken.org/rpc`,
      accounts: [private_key],
      chainId: 361,
      gasPrice: 4000000000000,
    },
    theta_testnet: {
      url: `https://eth-rpc-api-testnet.thetatoken.org/rpc`,
      accounts: [private_key],
      chainId: 365,
      gasPrice: 4000000000000,
    },
  },
};
