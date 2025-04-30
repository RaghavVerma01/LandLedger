import { ethers } from "ethers";
import { getContracts } from "./contracts";

export const buyProperty = async(
    tokenId: number,
    seller:string,
    price: string | number
):Promise<string>=>{
    try{
        const {propertyContract,escrowContract} = await getContracts();
        
        // Get signer(buyer)
        const signerAddress = await propertyContract.signer.getAddress();

        // Create the escrow
        const txCreate = await escrowContract.createEscrow(
            propertyContract.target,
            tokenId,
            seller,
            ethers.parseEther(price.toString())
        );
        const receiptCreate = await txCreate.wait();

        // Extract the escrow ID from the emitted event
        const escrowCreatedEvent = receiptCreate.logs
        .map((log:any)=>{
            try{
                return escrowContract.interface.parseLog(log);
            }catch{
                return null
            }
        })
        .find((parsed:any)=>parsed && parsed.name === "EscrowCreated");

        if(!escrowCreatedEvent){
            throw new Error("EscrowCreated event not found in transaction logs");
        }

        const escrowId:string = escrowCreatedEvent.args[0];

        // Deposit funds into the escrow
        const txDeposit = await escrowContract.depositFunds(escrowId,{
            value: ethers.parseEther(price.toString()),
        });
        await txDeposit.wait();

        console.log("Escrow Created and funds deposited to the escrow successfully.");
        return escrowId

    }catch(error:any){  
        console.error("Error in buyProperty: ",error);
        throw error;
    }   
}