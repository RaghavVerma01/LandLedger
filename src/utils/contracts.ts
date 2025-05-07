import { ethers } from "ethers";
import PropertyABI from '../contracts/abis/Property.json'
import EscrowABI from '../contracts/abis/Escrow.json'

export const propertyAddress:string = "0xCabe9d1055da5CB2EeD6Fa60f3694BB06CB3b1A8";   
export const escrowAddress:string = "0xBF74a3492071AF2b2762847045e2BB02d9e42739";

export const getContracts = async()=>{
    if(!window.ethereum){
        throw new Error("Metamask is not installed");
    }

    await window.ethereum.request({method:"eth_requestAccounts"});

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const propertyContract = new ethers.Contract(
        propertyAddress,
        PropertyABI.abi,
        signer
    );
    const escrowContract = new ethers.Contract(
        escrowAddress,
        EscrowABI.abi,
        signer
    );

    return {propertyAddress,escrowAddress,propertyContract,escrowContract,provider,signer};
}

export const createEscrow = async (
    tokenId: number,
    seller: string,
    price: string,
    escrowContract: ethers.Contract,
    signer: ethers.Signer
  ) => {
    try {
      const tx = await escrowContract.connect(signer).createEscrow(
        propertyAddress,
        tokenId,
        seller,
        ethers.utils.parseEther(price)
      );
      const receipt = await tx.wait();
      const event = receipt.events?.find((e) => e.event === "EscrowCreated");
  
      return {
        success: true,
        escrowId: event?.args?.escrowId?.toString(),
      };
    } catch (error) {
      console.error("Error creating escrow:", error);
      return { success: false, error };
    }
  };
  
  /**
   * Approves the property transfer to the escrow.
   */
  export const approvePropertyTransfer = async (
    tokenId: number,
    propertyContract: ethers.Contract,
    escrowAddress: string,
    signer: ethers.Signer
  ) => {
    try {
      const tx = await propertyContract.connect(signer).approve(escrowAddress, tokenId);
      await tx.wait();
      return { success: true };
    } catch (error) {
      console.error("Error approving property transfer:", error);
      return { success: false, error };
    }
  };
  
  /**
   * Deposits ETH into the escrow.
   */
  export const depositFunds = async (
    escrowId: number,
    amountEth: string,
    escrowContract: ethers.Contract,
    signer: ethers.Signer
  ) => {
    try {
      const tx = await escrowContract
        .connect(signer)
        .depositFunds(escrowId, { value: ethers.utils.parseEther(amountEth) });
      await tx.wait();
      return { success: true };
    } catch (error) {
      console.error("Error depositing funds:", error);
      return { success: false, error };
    }
  };
  
  /**
   * Approves the sale from buyer/seller/inspector.
   */
  export const approveEscrow = async (
    escrowId: number,
    escrowContract: ethers.Contract,
    signer: ethers.Signer
  ) => {
    try {
      const tx = await escrowContract.connect(signer).approve(escrowId);
      await tx.wait();
      return { success: true };
    } catch (error) {
      console.error("Error approving escrow:", error);
      return { success: false, error };
    }
  };
  
  /**
   * Updates the inspection status.
   */
  export const updateInspectionStatus = async (
    escrowId: number,
    passed: boolean,
    escrowContract: ethers.Contract,
    signer: ethers.Signer
  ) => {
    try {
      const tx = await escrowContract.connect(signer).updateInspectionStatus(escrowId, passed);
      await tx.wait();
      return { success: true };
    } catch (error) {
      console.error("Error updating inspection status:", error);
      return { success: false, error };
    }
  };
  
  /**
   * Finalizes the sale if all approvals are done.
   */
  export const finalizeSale = async (
    escrowId: number,
    escrowContract: ethers.Contract,
    signer: ethers.Signer
  ) => {
    try {
      const tx = await escrowContract.connect(signer).finalizeSale(escrowId);
      await tx.wait();
      return { success: true };
    } catch (error) {
      console.error("Error finalizing sale:", error);
      return { success: false, error };
    }
  };
  
  /**
   * Cancels the escrow (buyer/seller/inspector).
   */
  export const cancelEscrow = async (
    escrowId: number,
    escrowContract: ethers.Contract,
    signer: ethers.Signer
  ) => {
    try {
      const tx = await escrowContract.connect(signer).cancelSale(escrowId);
      await tx.wait();
      return { success: true };
    } catch (error) {
      console.error("Error canceling escrow:", error);
      return { success: false, error };
    }
  };