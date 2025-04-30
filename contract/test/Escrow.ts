import { expect } from "chai";
import { ethers } from "hardhat";
import { Escrow, Property } from "../typechain-types";
import { AddressLike, BytesLike, Signer } from "ethers";
import { parseEther } from "ethers";

describe("Escrow Contract", function () {
  let escrow: Escrow;
  let property: Property;
  let owner: Signer;
  let buyer: Signer;
  let seller: Signer;
  let other: Signer;

  const tokenId = 1;
  const price = parseEther("10");
  const feeRate = 100; // 1%

  let escrowId: BytesLike;

  beforeEach(async () => {
    [owner, buyer, seller, other] = await ethers.getSigners();

    const Property = await ethers.getContractFactory("Property");
    property = await Property.deploy(
      "LandLedger",                // name
      "LND",                       // symbol
      await owner.getAddress(),     // initial royalty recipient
      500                           // royalty basis points (e.g., 5%)
    );
    // await property.mint(await seller.getAddress(), tokenId);
    const sellerAddress = await seller.getAddress();
    // console.log("Seller Address: ", sellerAddress);
    await property.connect(seller).createProperty(
      sellerAddress,
      "https://example.com/metadata/1",
      "New York, NY",
      ethers.parseEther("10"),
      1200,
      3,
      2,
      2020
    )
    const propertyContract = property.getAddress();
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = (await Escrow.deploy(propertyContract,feeRate, 30 * 24 * 60 * 60)) as unknown as Escrow;

    await property.connect(seller).approve(await escrow.getAddress(), tokenId);

    const tx = await escrow.connect(buyer).createEscrow(
      await property.getAddress(),
      tokenId,
      await seller.getAddress(),
      price
    );
    const receipt = await tx.wait();
    // const event = receipt?.logs?.find((log: any) => log.eventName === "EscrowCreated");
    const event = receipt?.logs.map((log:any)=>{
      try{
        return escrow.interface.parseLog(log);
      }catch{
        return null
      }
    })
    .find((parsed)=>parsed?.name==="EscrowCreated")
    escrowId = event?.args?.escrowId;
  });

  it("should create escrow", async () => {
    // console.log("EscrowId: ",escrowId);
    const escrowData = await escrow.getEscrowDetails(escrowId);
    expect(escrowData.buyer).to.equal(await buyer.getAddress());
    expect(escrowData.seller).to.equal(await seller.getAddress());
    expect(escrowData.amount).to.equal(price);
    expect(escrowData.status).to.equal(1); // Active
  });

  it("should allow buyer to deposit funds", async () => {
    await expect(
      escrow.connect(buyer).depositFunds(escrowId, {
        value: price,
      })
    ).to.emit(escrow, "FundsDeposited");
  });

  it("should not allow non-buyer to deposit funds", async () => {
    await expect(
      escrow.connect(seller).depositFunds(escrowId, {
        value: price,
      })
    ).to.be.revertedWithCustomError(escrow, "NotAuthorized");
  });

  it("should update inspection status", async () => {
    await escrow.connect(buyer).updateInspectionStatus(escrowId, true);
    const escrowData = await escrow.getEscrowDetails(escrowId);
    expect(escrowData.inspectionPassed).to.be.true;
  });

  it("should complete escrow after both approvals", async () => {
    await escrow.connect(buyer).depositFunds(escrowId, { value: price });
    await escrow.connect(buyer).updateInspectionStatus(escrowId, true);
    await escrow.connect(buyer).approveEscrow(escrowId);
    await expect(escrow.connect(seller).approveEscrow(escrowId)).to.emit(escrow, "EscrowCompleted");

    const newOwner = await property.ownerOf(tokenId);
    expect(newOwner).to.equal(await buyer.getAddress());
  });

  it("should allow owner to cancel and refund", async () => {
    await escrow.connect(buyer).depositFunds(escrowId, { value: price });

    await expect(escrow.connect(owner).cancelEscrow(escrowId, "Testing cancel")).to.emit(
      escrow,
      "EscrowCancelled"
    );

    const escrowData = await escrow.getEscrowDetails(escrowId);
    expect(escrowData.status).to.equal(3); // Cancelled
  });

  it("should raise and resolve disputes", async () => {
    await escrow.connect(buyer).depositFunds(escrowId, { value: price });

    await escrow.connect(buyer).disputeEscrow(escrowId, "Dispute reason");
    const disputed = await escrow.getEscrowDetails(escrowId);
    expect(disputed.status).to.equal(4); // Disputed

    await escrow.connect(owner).resolveDispute(escrowId, 3); // Cancelled
    const resolved = await escrow.getEscrowDetails(escrowId);
    expect(resolved.status).to.equal(3);
  });

  it("should allow owner to update fee rate and time limit", async () => {
    await expect(escrow.connect(owner).updateFeeRate(150)).to.emit(escrow, "FeeRateUpdated");
    await expect(escrow.connect(owner).updateTimeLimit(86400)).to.emit(
      escrow,
      "TimeLimitUpdated"
    );
  });
});
