import EscrowABI from '../contracts/abis/Escrow.json';
import { ethers } from 'ethers';

const escrowAddress = '0x3b429368A3A656318933Bc27EC83E89B3d39d2eb';

const getEscrowContract = async () => {
    if (!window.ethereum) throw new Error("Metamask not detected");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const escrowContract = new ethers.Contract(escrowAddress, EscrowABI.abi, signer);

    return { escrowContract, signer };
}





export const createEscrow = async (propertyContract, tokenId, seller, priceInEth) => {
    const { escrowContract } = await getEscrowContract();
    const priceWei = ethers.parseEther(priceInEth.toString());
    const tx = await escrowContract.createEscrow(propertyContract, tokenId, seller, priceWei);
    const receipt = await tx.wait();

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

export const depositFunds = async (escrowId, amountInEth) => {
    const { escrowContract } = await getEscrowContract();

    const tx = await escrowContract.depositFunds(escrowId, {
        value: ethers.parseEther(amountInEth.toString()),
    });

    await tx.wait();
};

// Buyer or seller approves the escrow
export const approveEscrow = async (escrowId) => {
    const { escrowContract } = await getEscrowContract();

    const tx = await escrowContract.approveEscrow(escrowId);
    await tx.wait();
};

// Inspector updates the inspection result
export const updateInspectionStatus = async (escrowId, passed) => {
    const { escrowContract } = await getEscrowContract();

    const tx = await escrowContract.updateInpspectionStatus(escrowId, passed);
    await tx.wait();
}

// Cancel an escrow
export const cancelEscrow = async (escrowId, reason) => {
    const { escrowContract } = await getEscrowContract();

    const tx = await escrowContract.cancelEscrow(escrowId, reason);
    await tx.wait();
};

// Load escrow details

export const getEscrowDetails = async (escrowId) => {
    const { escrowContract } = await getEscrowContract();
    const details = await escrowContract.getEscrowDetails(escrowId);
    return details;
};