import React, { useEffect, useState } from "react";
import { usePropertyContext } from "@/contexts/propertyContext";
import { getEscrowDetails, approveEscrow, cancelEscrow } from "@/utils/escrowUtils";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SellerDashboard: React.FC = () => {
    const { properties } = usePropertyContext()
    const [ escrows, setEscrows ]= useState<any[]>([])
    const [status, setStatus] = useState<string>("")

    const sellerWallet = localStorage.getItem("walletAddress")

    useEffect(() => {
        const loadEscrows = async () => {
            try {
                const sellerProperties = properties.filter(
                    (p) => p.seller?.walletAddress?.toLowerCase() === sellerWallet?.toLowerCase()
                );
                const escrowDetails: any[]=[];
                for(const property of sellerProperties){
                    try{
                        const escrow = await getEscrowDetails(property.blockchainId);
                        escrowDetails.push({
                            property,
                            ...escrow,
                        });
                    }catch{
                        // No Escrow found for this property
                    }
                }
                setEscrows(escrowDetails)
            }catch(err){
                console.error("Error fetching seller escrows: ",err);
            }
        };
        loadEscrows()
    },[properties,sellerWallet]);

    const handleApprove = async(escrowId: string)=>{
        try{
            setStatus("Approving Escrow...");
            await approveEscrow(escrowId);
            setStatus("Escrow approved successfully");
        }catch(err:any){
            setStatus(`Error: ${err.message}`)
        }
    };

    const handleCancel = async(escrowId:string)=>{
        try{
            setStatus("Cancelling Escrow...");
            await cancelEscrow(escrowId,"Seller Cancelled sale");
            setStatus("Escrow Cancelled");
        }catch(err:any){
            console.error(`Error: ${err.message}`);
        }
    };

    return(
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50 p-8">
                <h1 className="text-2xl font-bold mb-6">Seller Dashboard</h1>
                {escrows.length===0?(
                    <p className="text-gray-600">No active escrows found</p>
                ):(
                    <div className="grid grid-cols-1 gap-6">
                        {escrows.map((escrow,idx)=>(
                            <Card key={idx} className="shadow-md">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-semibold mb-2">
                                        {escrow.property.title}
                                    </h2>
                                    <p><strong>Buyer:</strong> {escrow.buyer}</p>
                                    <p><strong>Price:</strong> {escrow.price?.toString()} wei</p>
                                    <p><strong>Status:</strong> {escrow.active?"Active":"Completed"}</p>

                                    <div className="flex space-x-4 mt-4">
                                        <Button onClick={()=>handleApprove(escrow.escrowId)}>
                                            Approve Sale
                                        </Button>
                                        <Button variant="destructive" onClick={()=>handleCancel(escrow.escrowId)}>
                                            Cancel Sale
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {status&&<p className="mt-4 text-sm text-gray-600">{status}</p>}
            </main>
            <Footer />
        </div>
    );
};

export default SellerDashboard;