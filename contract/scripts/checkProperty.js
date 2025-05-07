const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Replace with your deployed Property contract address
  const propertyAddress = "0xCabe9d1055da5CB2EeD6Fa60f3694BB06CB3b1A8";

  const Property = await ethers.getContractFactory("Property");
  const property = await Property.attach(propertyAddress);

  const total = await property.totalSupply();
  console.log(`Total properties: ${total.toString()}\n`);

  for (let i = 0; i < total; i++) {
    const tokenId = await property.tokenByIndex(i);
    const details = await property.getPropertyDetails(tokenId);
    const owner = await property.ownerOf(tokenId);
    const tokenURI = await property.tokenURI(tokenId);

    console.log(`🏠 Property #${tokenId.toString()}`);
    console.log(`  • Owner:         ${owner}`);
    console.log(`  • Token URI:     ${tokenURI}`);
    console.log(`  • Token ID:      ${tokenId}`);
    console.log(`  • Location:      ${details.location}`);
    console.log(`  • Price:         ${ethers.formatEther(details.price)} ETH`);
    console.log(`  • Status:        ${Object.keys(details)[details.status]}`);
    console.log(`  • Square Footage:${details.sqFootage}`);
    console.log(`  • Bedrooms:      ${details.bedrooms}`);
    console.log(`  • Bathrooms:     ${details.bathrooms}`);
    console.log(`  • Year Built:    ${details.yearBuilt}`);
    console.log("----------------------------------\n");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
