import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WalletProvider } from './contexts/WalletContext.tsx';
import { PropertyProvider } from './contexts/propertyContext.tsx';

createRoot(document.getElementById("root")!).render(
    <PropertyProvider>
        <WalletProvider>
            <App />
        </WalletProvider>
    </PropertyProvider>
);
