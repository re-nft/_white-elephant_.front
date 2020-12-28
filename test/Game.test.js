const { expect } = require("chai");

let g;
let owner;

before(async function () {
  [owner] = await ethers.getSigners();
  const Game = await ethers.getContractFactory("Game");
  g = await Game.deploy();
  g.deployed();
});

describe("Game", function () {
  it("initializes correct nft depositors", async function () {
    expect(
      await g.depositors("0x465DCa9995D6c2a81A9Be80fBCeD5a770dEE3daE")
    ).to.equal(true);
    expect(
      await g.depositors("0x426923E98e347158D5C471a9391edaEa95516473")
    ).to.equal(true);
    expect(
      await g.depositors("0x63A556c75443b176b5A4078e929e38bEb37a1ff2")
    ).to.equal(true);
  });

  it("disallows non-whitelisted depositors", async function () {
    // deposits with owner account
    await expect(
      g.deposit([ethers.constants.AddressZero], [0])
    ).to.be.revertedWith("you are not allowed to deposit");
  });

  it("adds new whitelisted depositors", async function () {
    await g.addDepositors([owner.address]);
    expect(await g.depositors(owner.address)).to.equal(true);
  });
});
