import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Property {
  title:string;
  description:string;
  location: string;
  price: number;
  status: any;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  blockchainId: string;
  features?:string[];
  imageUrl: string[];
}

interface PropertyContextType {
  submitProperty: (formData: Omit<Property, "blockchainId">) => Promise<void>;
  fetchProperties:()=> Promise<void>;
  properties: Property[];
  error;
  
  loading: boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitProperty = async (formData: Omit<Property, "blockchainId">) => {
    setLoading(true);
    try {
      const propertyWithId: Property = {
        ...formData,
        blockchainId: uuidv4(),
      };

      const res = await fetch("http://localhost:5000/api/property/addProperty", {
        method: "POST",
        headers: {
          "auth-token":localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyWithId),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("Server error: ",data);
        console.log("Auth token is: ",localStorage.getItem("token"))
        throw new Error("Failed to submit property");
      }

      console.log("✅ Property submitted successfully");
    } catch (error) {
      console.error("❌ Error submitting property:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/property/fetchProperty", {
        headers: {
          "Content-Type": "application/json",
          "auth-token":localStorage.getItem('token')
        },
      });

      if (!res.ok) throw new Error("Failed to fetch properties");

      const data = await res.json();
      setProperties(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchProperties();
  },[]);

  return (
    <PropertyContext.Provider value={{ submitProperty,fetchProperties,loading,properties,error }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const usePropertyContext = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("usePropertyContext must be used within a PropertyProvider");
  }
  return context;
};
