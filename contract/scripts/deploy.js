const hre = require("hardhat");

async function main(){
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account", deployer.address);

    // Deploying Property Contract

    const Property = await hre.ethers.getContractFactory("Property");
    const property = await Property.deploy(
        "LandLedger",
        "LND",
        deployer.address,
        500
    );
    await property.waitForDeployment();

    console.log("Property Contract Deployed at: ", property.target);

    // Setting values for feeRate and Time Limit
    const feeRate = 200;
    const timeLimit = 3600*24*3 //3 Days

    // Depoloy Escrow contract

    const Escrow = await hre.ethers.getContractFactory("Escrow");
    // console.log("The property address is: ", property.target);
    const escrow = await Escrow.deploy(property.target,feeRate,timeLimit);
    await escrow.waitForDeployment();
    console.log("Escrow Contract deployed at: ",escrow.target);

    // Transfer ownership of Property to Escrow Contract
    const tx = await property.transferOwnership(escrow.target);
    await tx.wait();
    console.log("Ownership of Property contract transferred to Escrow");
}

main().catch((error)=>{
    console.log("Error in deployment: ", error);
    process.exitCode = 1;
});