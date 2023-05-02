const { ethers, network } = require("hardhat");
const fs = require("fs");

const frontEndContractsFile = "../frontend/constants/networkMapping.json";

const frontEndAbiLocation = "../frontend/constants/";

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    await updateContractAddresses();
    await updateAbi();
  }
};

async function updateAbi() {
  const userFactory = await ethers.getContract("UserFactory");
  fs.writeFileSync(
    `${frontEndAbiLocation}UserFactory.json`,
    userFactory.interface.format(ethers.utils.FormatTypes.json)
  );
}
async function updateContractAddresses() {
  const userFactory = await ethers.getContract("UserFactory");
  const chainId = network.config.chainId?.toString();
  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );
  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId]["UserFactory"].includes(userFactory.address)
    ) {
      contractAddresses[chainId]["UserFactory"].push(userFactory.address);
    }
  } else {
    contractAddresses[chainId] = { UserFactory: [userFactory.address] };
  }

  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}

module.exports.tags = ["all", "frontend"];

// command to update the deployed address on frontend  :
// hh deploy --network localhost --tags frontend
