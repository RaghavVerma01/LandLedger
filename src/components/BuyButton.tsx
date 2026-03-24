import React,{useState} from "react";
import {Button} from '@/components/ui/button';
import { createEscrow } from "@/utils/escrowUtils";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";

interface BuyButtonProps{
    propertyId:string; //Mongo ID
    tokenId:string; //Blockchain ID
    price:number;
    seller:string;
    propertyContract:string;
    onSuccess:()=>void; //Callback to update UI on PropertyDetails page
}

const BuyButton:React.FC<BuyButtonProps>=({
    propertyId,
    tokenId,
    price,
    seller,
    propertyContract,
    onSuccess
})=>{
    const [loading,setLoading] = useState(false);
    const [status,setStatus] = useState<string>("")
    const {toast} = useToast();

    const handleBuy = async()=>{
        try{
            setLoading(true);
            setStatus("Please confirm the transaction in Metamask...");

            //1. Initiate Escrow on Blockchain
            const newEscrowId = await createEscrow(propertyContract,tokenId,seller,price);
            setStatus(`Escrow created (ID:${newEscrowId}). Locking property in Database...`);

            //2. Get the buyer's wallet address
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const buyerWallet = await signer.getAddress();

            //3. Sync with DB
            const response = await fetch(`http://localhost:5000/api/property/update-escrow/${propertyId}`,{
                method:'PATCH',
                headers:{
                    'Content-Type':'application/json',
                    'auth-token':localStorage.getItem('token')||''
                },
                body:JSON.stringify({
                    escrowId:newEscrowId.toString(),
                    buyerWallet:buyerWallet
                })
            });

            if(!response.ok){
                throw new Error("Failed to update database, but blockchain transaction succeeded.");
            }

            toast({
                title:"Offer Submitted!",
                description:"The property is now locked in escrow. Waiting for Seller Approval."
            })

            //4. Updating the parent UI (Property Details Page)
            onSuccess();
        }catch(err:any){
            console.error("Buy error: ",err);
            toast({
                title:"Transaction Failed",
                description:err.message||"An error occurred",
                variant:'destructive'
            })
            setStatus(""); //Clear Status on error
        }finally{
            setLoading(false);
        }
    }

    return (
        <div>
            <Button
                onClick={handleBuy}
                disabled={loading}
                className="w-full mt-2 bg-estate-secondary hover:bg-estate-secondary/80"
            >
                {loading ? "Processing..." : "Buy Property"}
            </Button>
            {status && (
                <p className="mt-2 text-sm text-gray-600 font-medium text-center">
                    {status}
                </p>
            )}
        </div>
    );
}

export default BuyButton;