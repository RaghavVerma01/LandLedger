import React, { createContext, useState, useEffect, useContext } from "react";
import { ethers } from "ethers";

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

    const bindWallet = async (address,signature )=>{
        await fetch('http://localhost:5000/api/auth/bind-wallet',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'auth-token':localStorage.getItem('token'),
            },
            body:JSON.stringify({
                walletAddress:address,
                signature:signature,
            })

        })
    }
        return(
            <WalletContext.Provider value = {{bindWallet,currentAccount,connectWallet}}>
                {children}
            </WalletContext.Provider>
        );
};