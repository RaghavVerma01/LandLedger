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
};