
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Profile = () => {
  const [account, setAccount] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAccount = localStorage.getItem("walletAddress");
    if (savedAccount) {
      setAccount(savedAccount);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask browser extension to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setAccount(address);
      localStorage.setItem("walletAddress", address);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });
    } catch (error) {
      console.error("Error connecting to MetaMask", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to your wallet",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem("walletAddress");
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Profile</CardTitle>
            <CardDescription>Manage your account and wallet settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold">Wallet Status</h3>
                <p className="text-sm text-gray-600">
                  {account ? (
                    <>Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</>
                  ) : (
                    "No wallet connected"
                  )}
                </p>
              </div>
              <Button
                variant={account ? "outline" : "default"}
                onClick={account ? disconnectWallet : connectWallet}
                className="flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                {account ? "Disconnect" : "Connect Wallet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
