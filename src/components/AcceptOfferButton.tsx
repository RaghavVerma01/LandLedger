import React,{useState} from "react";
import {Button} from "@/components/ui/button";
import { approvePropertyTransfer } from "@/utils/escrowUtils";
import { useToast } from "@/hooks/use-toast";

interface AcceptOfferButtonProps{
    tokenId: string; //Blockchain ID of property
    onSuccess?: ()=>void //Callback to refresh the dashboard
}

const AcceptOfferButton:React.FC<AcceptOfferButtonProps> = ({tokenId,onSuccess})=>{
    const[loading,setLoading] = useState(false);
    const {toast} = useToast();

    const handleAccept = async()=>{
        try{
            setLoading(true);

            //1. Trigger Metamask for seller to approve the Escrow Contract
            await approvePropertyTransfer(tokenId);

            toast({
                title:"Offer Accepted!",
                description:"The Escrow Contract is now authorized to handle this property. Waiting for Buyer to deposit funds"
            });

            //2. Callback to refresh UI
            if(onSuccess) onSuccess();
        }catch(err:any){
            console.error("Approval Error: ",err);
            toast({
                title:"Transaction Failed",
                description: err.reason||err.message||"Failed to approve the transfer.",
                variant:'destructive'
            });
        }finally{
            setLoading(false);
        }
    };
    return (
        <Button
            onClick={handleAccept}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
            {loading ? "Approving in MetaMask..." : "Accept Offer & Lock Property"}
        </Button>
    );
}
export default AcceptOfferButton;