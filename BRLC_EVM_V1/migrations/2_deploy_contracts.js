const BrazilianRealCoin = artifacts.require("BrazilianRealCoin");
 
module.exports = async function (deployer) { 
  await deployer.deploy(BrazilianRealCoin);
};
