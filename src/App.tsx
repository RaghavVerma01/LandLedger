
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SellProperty from "./pages/SellProperty";
import NotFound from "./pages/NotFound";
import PaymentEscrow from "./pages/PaymentEscrow";
import Profile from "./pages/Profile";
import Aiprediction from "./pages/Aiprediction";
import React from "react";
import SellerDashboard from "./pages/SellerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sellerdashboard" element={<SellerDashboard />} />

            <Route path="/signup" element={<Signup />} />
            <Route path="/sell" element={<SellProperty />} />
            <Route path="/payment" element={<PaymentEscrow />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/aipredict" element={<Aiprediction />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
