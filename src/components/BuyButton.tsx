import React, { useState } from "react";
import { getContracts } from "@/utils/contracts";
import { ethers, Transaction } from "ethers";

type Props={
    tokenId : string;
    price:number; //in ETH
    seller: string;
};

const BuyButton: React.FC<Props> = ({tokenId,price,seller})=>{
    const[status,setStatus] = useState('');
    const[loading,setLoading] = useState(false);

    const handleBuy = async()=>{
        setLoading(true);
        try{
            setStatus("Connecting to contracts...");
            const {
                propertyAddress,
                escrowContract,
                signer
            } = await getContracts();

            const priceInWei = ethers.parseEther(price.toString());
            setStatus("Creating Escrow");

            const createTx = await escrowContract.createEscrow(
                propertyAddress,
                tokenId,
                seller,
                priceInWei
            );

            const receipt = await createTx.wait();

            // Get EscrowCreated event and extract the escrowId

            const escrowEvent=receipt.logs.map(log=>{
                try{
                    return escrowContract.interface.parseLog(log);
                }catch(e){
                    return null;
                }
            })
            .find(event => event && event.name === "EscrowCreated");

            if(!escrowEvent) throw new Error("EscrowCreated event not found");

            const escrowId = escrowEvent.args.escrowId;

            setStatus("Depositing funds...");

            const depositTx = await escrowContract.depositFunds(escrowId,{
                value:priceInWei,
            });

            await depositTx.wait();
            setStatus("Funds Deposited. Awaiting inspection and approval");
        }catch(err:any){
            console.error(err);
            setStatus("Transaction Failed: "+ (err?.reason||err?.message));
        }finally{
            setLoading(false);
        }
    };

    return (
    <div className="p-4 border rounded shadow">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Buy'}
      </button>
      {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
    </div>
  );
};

export default BuyButton;