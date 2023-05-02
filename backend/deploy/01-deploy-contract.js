const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("--------------------------");

  const collateralBackedToken = await deploy("UserFactory", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("--------------------------");
};

module.exports.tags = ["all", "userfactory"];
