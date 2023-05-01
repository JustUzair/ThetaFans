require("@nomicfoundation/hardhat-toolbox");

const private_key = 'PRIVATE_KEY';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks:{
    theta_testnet: {
      url: `https://eth-rpc-api.thetatoken.org/rpc`,
      accounts: [private_key],
      chainId: 361,
      gasPrice: 4000000000000
    },
    theta_testnet: {
      url: `https://eth-rpc-api-testnet.thetatoken.org/rpc      `,
      accounts: [private_key],
      chainId: 365,
      gasPrice: 4000000000000
    },
  }
};



