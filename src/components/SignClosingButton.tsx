import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveEscrow, getEscrowDetails } from "@/utils/escrowUtils";
import { useToast } from "@/hooks/use-toast";

interface SignClosingButtonProps {
    escrowId: string;
    propertyId:string,
    isBuyer: boolean;
    onSuccess?: () => void;
}

const SignClosingButton: React.FC<SignClosingButtonProps> = ({ escrowId,propertyId, isBuyer, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSign = async () => {
        try {
            setLoading(true);
            await approveEscrow(escrowId);

            const latestEscrowData = await getEscrowDetails(escrowId);
            if (latestEscrowData.completed) {
                // 3. If the blockchain says it's done, tell MongoDB!
                await fetch(`http://localhost:5000/api/property/complete-escrow/${propertyId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('token') || ''
                    }
                });

                toast({
                    title: "Escrow Complete!",
                    description: "The property and funds have been successfully transferred.",
                });
            } else {
                toast({
                    title: "Document Signed!",
                    description: "Your approval has been submitted. Waiting for the other party.",
                });
            }

            if (onSuccess) onSuccess();

        } catch (err: any) {
            console.error("Signing Error: ", err);
            toast({
                title: "Transaction Failed",
                description: err.message || "Failed to sign document.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSign}
            disabled={loading}
            className="w-full bg-estate-primary hover:bg-estate-primary/90 text-white mt-2"
        >
            {loading ? "Signing via MetaMask..." : `Finalize & Sign (${isBuyer ? "Buyer" : "Seller"})`}
        </Button>
    );
};

export default SignClosingButton;