import { ethers } from "ethers";
import PropertyABI from '../contracts/abis/Property.json'
import EscrowABI from '../contracts/abis/Escrow.json'

const propertyAddress:string = "0x5FbDB2315678afecb367f032d93F642f64180aa3";   
const escrowAddress:string = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

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

    return {propertyContract,escrowContract,provider,signer};
}