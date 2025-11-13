import { ethers } from "ethers";
import PropertyABI from '../contracts/abis/Property.json'
import EscrowABI from '../contracts/abis/Escrow.json'

export const propertyAddress:string = "0x75d6A01849b86825c4895cB17318fD804EDd29ce";   
export const escrowAddress:string = "0x3b429368A3A656318933Bc27EC83E89B3d39d2eb";

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
};