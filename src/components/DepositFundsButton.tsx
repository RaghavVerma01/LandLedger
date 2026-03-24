import React,{useState} from "react";
import {Button} from '@/components/ui/button';
import { depositFunds } from "@/utils/escrowUtils";
import { useToast } from "@/hooks/use-toast";

interface DepositFundsButtonProps {
    escrowId:string;
    price:number;
    onSuccess?:()=>void;
}

const DepositFundsButton:React.FC<DepositFundsButtonProps> = ({escrowId,price,onSuccess})=>{
    const [loading,setLoading] = useState(false);
    const {toast} = useToast();

    const handleDeposit = async()=>{
        try{
            setLoading(true);
            await depositFunds(escrowId,price);

            toast({
                title:"Funds Deposited!",
                description:"Your ETH is now safely locked in the Escrow Smart Contract.",
            });
            if(onSuccess) onSuccess();
        }catch(err:any){
            console.error("Deposit Error: ",err);
            toast({
                title:"Transaction Failed",
                description: err.reason || err.message || "Failed to Deposit Funds.",
                variant:'destructive'
            });
        }finally{
            setLoading(false);
        }
    }
    return (
        <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-2">
                The seller has approved the contract. Please deposit your funds to secure the property.
            </p>
            <Button
                onClick={handleDeposit}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
                {loading ? "Confirming via MetaMask..." : `Deposit ${price} ETH to Escrow`}
            </Button>
        </div>
    );
}
export default DepositFundsButton