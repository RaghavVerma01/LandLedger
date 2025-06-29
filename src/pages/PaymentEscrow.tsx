
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bitcoin, AlertCircle, CheckCircle2, Info, Loader2, Shield } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const formSchema = z.object({
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be greater than 0" })
    .refine((val) => !isNaN(val), {
      message: "Amount must be a valid number",
    }),
  propertyId: z.string().min(1, { message: "Property ID is required" }),
});

const PaymentEscrow = () => {
  const navigate = useNavigate();
  const [isDepositing, setIsDepositing] = useState(false);
  const [transactionStage, setTransactionStage] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      propertyId: "",
    },
  });

  const connectWallet = async () => {
    try {
      // This would be replaced with actual ethereum wallet connection logic
      setWalletConnected(true);
      toast.success("Wallet connected successfully", {
        description: "Your Ethereum wallet is now connected.",
      });
    } catch (error) {
      toast.error("Failed to connect wallet", {
        description: "Please make sure you have MetaMask installed and try again.",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!walletConnected) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet before making a deposit.",
      });
      return;
    }

    setIsDepositing(true);
    setTransactionStage(1);

    try {
      // Simulate blockchain transaction stages
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTransactionStage(2);
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTransactionStage(3);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Funds deposited to escrow", {
        description: `Successfully deposited ${values.amount} ETH for property #${values.propertyId}`,
      });
      
      // Redirect to property details after successful transaction
      // setTimeout(() => {
      //   navigate(`/property/${values.propertyId}`);
      // }, 2000);
    } catch (error) {
      toast.error("Transaction failed", {
        description: "There was an error processing your transaction. Please try again.",
      });
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-estate-tertiary bg-opacity-20">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-estate-primary mb-4">
              Secure Escrow Payment
            </h1>
            <p className="text-lg text-estate-dark opacity-80">
              Safely deposit funds into our blockchain-powered escrow for your property transaction
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-estate-primary border-opacity-10">
                <CardHeader className="bg-gradient-to-r from-estate-primary/5 to-estate-secondary/5">
                  <CardTitle className="text-estate-primary flex items-center gap-2">
                    {/* <Bitcoin size={24} /> Escrow Deposit */}
                    <img src="public\assets\ether.png" alt="" className="etherimage" /> Escrow Deposit
                  </CardTitle>
                  <CardDescription>
                    Enter the details below to make your escrow payment for the property.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter property ID" {...field} />
                            </FormControl>
                            <FormDescription>
                              ID of the property you are purchasing.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (ETH)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <span className="text-gray-500">ETH</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              The amount of ETH to deposit into the escrow.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {!walletConnected && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={connectWallet}
                        >
                          {/* <Bitcoin className="mr-2 h-4 w-4" /> */}
                          <img src="public\assets\ether.png" alt="" className="etherimage"/>
                          Connect Wallet
                        </Button>
                      )}
                      
                      {isDepositing && (
                        <div className="space-y-3 mt-6">
                          <p className="text-sm font-medium">Transaction in progress...</p>
                          <Progress value={transactionStage * 33} />
                          <div className="text-sm text-muted-foreground">
                            {transactionStage >= 1 && (
                              <div className="flex items-center gap-2 mb-2">
                                {transactionStage > 1 ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                <span>Initiating transaction...</span>
                              </div>
                            )}
                            
                            {transactionStage >= 2 && (
                              <div className="flex items-center gap-2 mb-2">
                                {transactionStage > 2 ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                <span>Confirming blockchain entry...</span>
                              </div>
                            )}
                            
                            {transactionStage >= 3 && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Escrow deposit completed!</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-estate-primary hover:bg-estate-primary/90"
                        disabled={isDepositing || !walletConnected}
                      >
                        {isDepositing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Deposit to Escrow"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="shadow-md border-estate-primary border-opacity-20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-estate-primary text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" /> Escrow Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-estate-primary" />
                    </div>
                    <p className="text-sm">Funds are locked and secured on the blockchain</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-estate-primary" />
                    </div>
                    <p className="text-sm">Released only when all parties agree or conditions are met</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-estate-primary" />
                    </div>
                    <p className="text-sm">Smart contract execution eliminates third-party risks</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-md border-estate-primary border-opacity-20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-estate-primary text-lg flex items-center gap-2">
                    <Info className="h-5 w-5" /> How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>Connect your Ethereum wallet</li>
                    <li>Enter the property ID and amount</li>
                    <li>Confirm the transaction in your wallet</li>
                    <li>Funds are securely held in the escrow contract</li>
                    <li>Released when property transfer is complete</li>
                  </ol>
                  <div className="bg-amber-100 border-l-4 border-amber-500 p-3 mt-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-amber-800">
                        Never share your private keys or seed phrase with anyone, including LandLedger representatives.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentEscrow;
