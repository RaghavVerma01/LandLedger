import React, { createContext, useState, useEffect, useContext } from "react";
import { ethers } from "ethers";

interface WalletContextType {
    currentAccount: string | null;
    connectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
    currentAccount: null,
    connectWallet: async () => { },
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

        return(
            <WalletContext.Provider value = {{currentAccount,connectWallet}}>
                {children}
            </WalletContext.Provider>
        );
};