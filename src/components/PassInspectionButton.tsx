import React,{useState} from "react";
import { Button } from "@/components/ui/button";
import { updateInspectionStatus } from "@/utils/escrowUtils";
import { useToast } from "@/hooks/use-toast";

interface PassInspectionButtonProps {
    escrowId: string;
    onSuccess?:()=>void;
}

const PassInspectionButton: React.FC<PassInspectionButtonProps> = ({escrowId,onSuccess})=>{
    const[loading,setLoading] = useState(false);
    const {toast} = useToast();

    const handleInspect = async()=>{
        try{
            setLoading(true);
            await updateInspectionStatus(escrowId,true);

            toast({
                title:"Inspection Passed",
                description:"Real-world Inspection has been passed."
            });
            if(onSuccess) onSuccess();
        } catch(err:any){
            console.error("Inspection Error: ",err);
            toast({
                title:"Transaction Failed",
                description: err.reason||err.message||"Failed to pass inspection.",
                variant:"destructive"
            });
        }finally{
            setLoading(false);
        }
    }

    return (
        <Button
            onClick={handleInspect}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-2"
        >
            {loading ? "Processing..." : "Simulate: Pass Inspection"}
        </Button>
    );
}

export default PassInspectionButton;