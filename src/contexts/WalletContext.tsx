import React, { createContext, useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";


interface WalletContextType {
    currentAccount: string | null;
    connectWallet: () => Promise<void>;
    bindWallet:(address,signature)=>Promise<void>;
}

export const WalletContext = createContext<WalletContextType>({
    currentAccount: null,
    connectWallet: async () => { },
    bindWallet:async()=>{},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState<string | null>(null);

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask is not installed!");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setCurrentAccount(accounts[0]);
    };

    useEffect(() => {
            const checkConnection = async () => {
                if (window.ethereum) {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await provider.listAccounts();
                    if(accounts.length>0){
                        setCurrentAccount(accounts[0].address);
                    }
                }
            };
            checkConnection();
        },[]);
    const {toast} = useToast();
    const bindWallet = async (address,signature )=>{
        const res = await fetch('http://localhost:5000/api/auth/bind-wallet',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'auth-token':localStorage.getItem('token'),
            },
            body:JSON.stringify({
                walletAddress:address,
                signature:signature,
            }),
        });

        if (!res.ok) {
            const error = await res.json();
            const err = new Error(error.msg || "Wallet Binding Failed");
            //@ts-ignore
            err.status = res.status;
            throw err;
            // if (res.status === 400) {
            //   // Wallet already bound to another user
            //   toast({
            //     title: "Wallet Binding Failed",
            //     description: "This wallet is already bound to another account.",
            //     variant: "destructive",
            //   });
      
            //   // Clear wallet from app state and localStorage
            //   setCurrentAccount(null);
            //   localStorage.removeItem("walletAddress");
      
            //   // Optional: block sensitive actions or show warning in UI
            // //   setWalletUnauthorized(true);
      
            //   return;
            // }else {
            //   throw new Error(`Unexpected error: ${res.status}`);
            // }
          }
    }
        return(
            <WalletContext.Provider value = {{bindWallet,currentAccount,connectWallet}}>
                {children}
            </WalletContext.Provider>
        );
};