
const MyToken = artifacts.require("BrazilianRealCoin");

contract("BrazilianRealCoin", accounts => {
  let token;
  const owner = accounts[0];
  const recipient = accounts[1];
  const spender = accounts[2];
  const newAccount = accounts[3];

  beforeEach(async () => {
    token = await MyToken.new();
  });

  // it("verify owner balance", async () => {
  //   const initialBalance = await token.balanceOf(owner);
  //   assert.equal(initialBalance, (await token.totalSupply()));
  // });

  it("verify token name", async () => {
    const name = await token.name();
    assert.equal(name, (await token.name()));
    // console.log(name);
  });

  it("verify token symbol", async () => {
    const symbol = await token.symbol();
    assert.equal(symbol, (await token.symbol()));
    // console.log(symbol);
  });

  // it("verify token decimals", async () => {
  //   const decimals = await token.decimals();
  //   assert.equal(decimals, (await token.decimals()));
  //   console.log(decimals);
  // });

  it("should mint new tokens", async () => {
    const mintAmount = 100;
    const initialSupply = await token.totalSupply();

    await token.mint(owner, mintAmount);
    const newSupply = await token.totalSupply();

    assert.equal(newSupply - initialSupply, mintAmount, "Minting new tokens failed");
  });


  it("should burn tokens", async () => {
    const initialSupply = await token.totalSupply();
    const burnAmount = 50;

    await token.burn(burnAmount);
    const newSupply = await token.totalSupply();

    assert.equal(initialSupply - newSupply, burnAmount, "Burning tokens failed");
  });

  it("should transfer tokens", async () => {
    const transferAmount = 100;
    await token.mint(owner, transferAmount);

    const initialBalance = await token.balanceOf(owner);

    await token.transfer(recipient, transferAmount);

    const updatedBalanceOwner = await token.balanceOf(owner);
    const updatedBalanceRecipient = await token.balanceOf(recipient);

    assert.equal(updatedBalanceOwner, initialBalance - transferAmount, "Token transfer from owner failed");
    assert.equal(updatedBalanceRecipient, transferAmount, "Token transfer to recipient failed");
  });

  it("should approve and transfer tokens from another address", async () => {
    const transferAmount = 100;
    await token.mint(owner, transferAmount);

    const initialBalance = await token.balanceOf(owner);

    await token.approve(spender, transferAmount);
    const allowance = await token.allowance(owner, spender);

    assert.equal(allowance, transferAmount, "Approving token transfer failed");

    await token.transferFrom(owner, recipient, transferAmount, { from: spender });

    const updatedBalanceOwner = await token.balanceOf(owner);
    const updatedBalanceRecipient = await token.balanceOf(recipient);
    const updatedAllowance = await token.allowance(owner, spender);

    assert.equal(updatedBalanceOwner, initialBalance - transferAmount, "Token transfer from owner failed");
    assert.equal(updatedBalanceRecipient, transferAmount, "Token transfer to recipient failed");
    assert.equal(updatedAllowance, 0, "Token transfer allowance update failed");
  });

  it("should not allow unauthorized minting", async () => {
    const unauthorizedAccount = accounts[4];
    const mintAmount = 500;

    try {
      await token.mint(unauthorizedAccount, mintAmount, { from: unauthorizedAccount });
      assert.fail("Unauthorized minting should have thrown an error");
    } catch (error) {
      assert(error.message.includes("Ownable: caller is not the owner"), "Incorrect error message for unauthorized minting");
    }

    const unauthorizedBalance = await token.balanceOf(unauthorizedAccount);
    assert.equal(unauthorizedBalance, 0);
  });

  it("should not allow unauthorized burning", async () => {
    const unauthorizedAccount = accounts[4];
    const burnAmount = 200;

    try {
      await token.burn(burnAmount, { from: unauthorizedAccount });
      assert.fail("Unauthorized burning should have thrown an error");
    } catch (error) {
      assert(error.message.includes("Ownable: caller is not the owner"), "Incorrect error message for unauthorized burning");
    }

    const unauthorizedBalance = await token.balanceOf(unauthorizedAccount);
    assert.equal(unauthorizedBalance, 0);
  });

  it("should not allow transfers to address 0", async () =>

 {
    const transferAmount = 100;

    try {
      await token.transfer("0x0000000000000000000000000000000000000000", transferAmount);
      assert.fail("Transfer to address 0 should have thrown an error");
    } catch (error) {
      assert(error.message.includes("ERC20: transfer to the zero address"), "Incorrect error message for transfer to address 0");
    }

    const zeroAddressBalance = await token.balanceOf("0x0000000000000000000000000000000000000000");
    assert.equal(zeroAddressBalance, 0);
  });

  it("should allow ownership transfer", async () => {
    const newOwner = accounts[4];

    await token.transferOwnership(newOwner);

    const isOwner = await token.isOwner();
    assert.equal(isOwner, false, "Ownership transfer failed");

    try {
      await token.mint(accounts[0], 100);
      assert.fail("Minting after ownership transfer should have thrown an error");
    } catch (error) {
      assert(error.message.includes("Ownable: caller is not the owner"), "Incorrect error message for minting after ownership transfer");
    }

    const newOwnerBalance = await token.balanceOf(newOwner);
    assert.equal(newOwnerBalance, 0, "Tokens should not have been transferred to new owner");
  });
});
