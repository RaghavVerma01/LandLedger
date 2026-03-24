import { ethers } from 'ethers';
import { escrowAddress, getContracts } from './contracts';


export const createEscrow = async (propertyContract, tokenId, seller, priceInEth) => {
    const { escrowContract } = await getContracts();
    const priceWei = ethers.parseEther(priceInEth.toString());
    const tx = await escrowContract.createEscrow(propertyContract, tokenId, seller, priceWei);
    const receipt = await tx.wait();
    console.log("Receipt: ", receipt);
    // Return escrowId from the emitted event or calculate locally if needed
    // Extract escrowId from the emitted event
    const event = receipt.logs
        .map(log => {
            try {
                return escrowContract.interface.parseLog(log);
            } catch {
                return null;
            }
        })
        .find(e => e && e.name === "EscrowCreated");

    if (!event) throw new Error("EscrowCreated event not found");

    const escrowId = event.args.escrowId;
    return escrowId;

};

export const approvePropertyTransfer = async (tokenId) => {
    const { propertyContract } = await getContracts();
    const tx = await propertyContract.approve(escrowAddress, tokenId);
    await tx.wait();
}

export const depositFunds = async (escrowId, amountInEth) => {
    const { escrowContract } = await getContracts();

    const tx = await escrowContract.depositFunds(escrowId, {
        value: ethers.parseEther(amountInEth.toString()),
    });

    await tx.wait();
};

// Buyer or seller approves the escrow
export const approveEscrow = async (escrowId) => {
    const { escrowContract } = await getContracts();

    const tx = await escrowContract.approveEscrow(escrowId);
    await tx.wait();
};

// Inspector updates the inspection result
export const updateInspectionStatus = async (escrowId, passed) => {
    const { escrowContract } = await getContracts();

    const tx = await escrowContract.updateInspectionStatus(escrowId, passed);
    await tx.wait();
}

// Cancel an escrow
export const cancelEscrow = async (escrowId, reason) => {
    const { escrowContract } = await getContracts();

    const tx = await escrowContract.cancelEscrow(escrowId, reason);
    await tx.wait();
};

// Load escrow details

export const getEscrowDetails = async (escrowId) => {
    const { escrowContract } = await getContracts();
    let formattedId = escrowId;
    if (!String(escrowId).startsWith("0x")) {
        formattedId = ethers.zeroPadValue(ethers.toBeHex(escrowId), 32);
    }
    console.log(`📡 Fetching blockchain data for Escrow ID:`, formattedId);
    const details = await escrowContract.getEscrowDetails(formattedId);
    try {
        // Fetch raw data
        const details = await escrowContract.getEscrowDetails(formattedId);

        // LOG 1: The Raw Data
        console.log("📦 RAW Blockchain Details:", details);

        const translatedData = {
            isFunded: details.isFunded,
            inspectionPassed: details.inspectionPassed,
            sellerApproved: details.sellerApproved,
            buyerApproved: details.buyerApproved,
            completed: details.buyerApproved && details.sellerApproved
        };

        // LOG 2: The Translated Data
        console.log("✅ Translated Data for UI:", translatedData);

        return translatedData;

    } catch (error) {
        console.error("🚨 Error fetching raw contract data:", error);
        throw error;
    }
};