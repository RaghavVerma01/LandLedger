// import React, { useState } from "react";
// import { getContracts } from "@/utils/contracts";
// import { ethers, Transaction } from "ethers";

// type Props={
//     tokenId : string;
//     price:number; //in ETH
//     seller: string;
// };

// const BuyButton: React.FC<Props> = ({tokenId,price,seller})=>{
//     const[status,setStatus] = useState('');
//     const[loading,setLoading] = useState(false);

//     const handleBuy = async()=>{
//         setLoading(true);
//         try{
//             setStatus("Connecting to contracts...");
//             const {
//                 propertyAddress,
//                 escrowContract,
//                 signer
//             } = await getContracts();

//             const priceInWei = ethers.parseEther(price.toString());
//             setStatus("Creating Escrow");

//             const createTx = await escrowContract.createEscrow(
//                 propertyAddress,
//                 tokenId,
//                 seller,
//                 priceInWei
//             );

//             const receipt = await createTx.wait();

//             // Get EscrowCreated event and extract the escrowId

//             const escrowEvent=receipt.logs.map(log=>{
//                 try{
//                     return escrowContract.interface.parseLog(log);
//                 }catch(e){
//                     return null;
//                 }
//             })
//             .find(event => event && event.name === "EscrowCreated");

//             if(!escrowEvent) throw new Error("EscrowCreated event not found");

//             const escrowId = escrowEvent.args.escrowId;

//             setStatus("Depositing funds...");

//             const depositTx = await escrowContract.depositFunds(escrowId,{
//                 value:priceInWei,
//             });

//             await depositTx.wait();
//             setStatus("Funds Deposited. Awaiting inspection and approval");
//         }catch(err:any){
//             console.error(err);
//             setStatus("Transaction Failed: "+ (err?.reason||err?.message));
//         }finally{
//             setLoading(false);
//         }
//     };

//     return (
//     <div className="p-4 border rounded shadow">
//       <button
//         onClick={handleBuy}
//         disabled={loading}
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//       >
//         {loading ? 'Processing...' : 'Purchase Property'}
//       </button>
//       {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
//     </div>
//   );
// };

// export default BuyButton;

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    createEscrow,
    depositFunds,
    approveEscrow,
    getEscrowDetails
} from "@/utils/escrowUtils";

interface BuyButtonProps {
    tokenId: string;
    price: number;
    seller: string;
    propertyContract: string
}

const BuyButton: React.FC<BuyButtonProps> = ({ tokenId, price, seller, propertyContract }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [escrowId, setEscrowId] = useState<string | null>(null);

    const handleBuy = async () => {
        try {
            setLoading(true);
            setStatus("Creating Escrow...");

            // 1. Create Escrow
            const newEscrowId = await createEscrow(propertyContract, tokenId, seller, price);
            setEscrowId(newEscrowId.toString());
            setStatus(`Escrow created (ID: ${newEscrowId})`);

            // 2. Deposit Funds
            setStatus("Depositing Funds into escrow...");
            await depositFunds(newEscrowId, price);
            setStatus("Funds Deposited Successfully");

            // 3. Buyer approval
            setStatus("Buyer Approval Pending...");
            await approveEscrow(newEscrowId);
            setStatus("Buyer approval complete.");

            // 4. Seller approval
            setStatus("Waiting for Seller approval...");
            const interval = setInterval(async () => {
                const details = await getEscrowDetails(newEscrowId);
                if (details.completed) {
                    clearInterval(interval);
                    setStatus("Purchase Complete! Property Transferred.");
                }
            }, 5000)
        }
        catch (err: any) {
            console.error("Buy Error: ", err);
            setStatus(`Error: ${err.message}`)
        }
        finally {
            setLoading(false);
        }
    };

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
                <p className="mt-2 text-sm text-gray-600">
                    {status}
                </p>
            )}
        </div>
    );
}

export default BuyButton;