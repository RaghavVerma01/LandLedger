import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { getContracts } from "@/utils/contracts";
import { ethers } from "ethers";
import { fetchPropertyFromChain } from "@/utils/checkProperty";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  X,
  Plus,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Ruler,
  Bed,
  Bath,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { usePropertyContext } from "@/contexts/propertyContext";

interface ImageUpload {
  id: string;
  file: File;
  preview: string;
}

const SellProperty = () => {
  
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageUpload[]>([]);
  const { submitProperty } = usePropertyContext();
  const [features, setFeatures] = useState<string[]>([]);
  const [currentFeature, setCurrentFeature] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: 0,
    squareFootage: 0,
    bedrooms: 0,
    bathrooms: 0,
    yearBuilt: 2020,
    status: "Available",
    features: [],
    imageUrls: []
  });
  // Change later, hardcoded for now
  // const imageUrl = ["https://example.com/nicehouse"]
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newImages: ImageUpload[] = Array.from(event.target.files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        preview: URL.createObjectURL(file),
      }));

      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter((image) => image.id !== id);

    // Revoke object URLs to avoid memory leaks
    const imageToRemove = images.find((image) => image.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    // setImages(updatedImages);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" || name === "squareFootage" || name === "bedrooms" || name === "bathrooms" || name === "yearBuilt"
        ? Number(value) : value
    }));
  }
  const addFeature = () => {
    if (currentFeature.trim() !== "" && !features.includes(currentFeature.trim())) {
      setFeatures([...features, currentFeature.trim()]);
      setCurrentFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter((f) => f !== feature));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  if (
    !formData.title || !formData.location || !formData.price ||
    !formData.squareFootage || !formData.bedrooms ||
    !formData.bathrooms || !formData.yearBuilt
  ) {
    toast({
      title: "Missing Information",
      description: "Please fill in all required fields.",
      variant: "destructive",
    });
    setIsLoading(false);
    return;
  }

  try {
    // Step 1: Mint the property on-chain
    const { propertyContract, signer } = await getContracts();
    const signerAddress = await signer.getAddress();
    const tokenURI = `https://landledger-metadata.com/dummy/${Date.now()}`;

    const tx = await propertyContract.createProperty(
      signerAddress,
      tokenURI,
      formData.location,
      ethers.parseEther(formData.price.toString()),
      formData.squareFootage,
      formData.bedrooms,
      formData.bathrooms,
      formData.yearBuilt
    );

    const receipt = await tx.wait();

    const tokenId = receipt.logs
      .map((log: any) => {
        try {
          return propertyContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed: any) => parsed?.name === "PropertyListed")?.args?.tokenId?.toString();

    if (!tokenId) throw new Error("Token ID not found in logs");

    // Step 2: Prepare FormData to send all data + images to backend
    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("location", formData.location);
    form.append("price", formData.price.toString());
    form.append("squareFootage", formData.squareFootage.toString());
    form.append("bedrooms", formData.bedrooms.toString());
    form.append("bathrooms", formData.bathrooms.toString());
    form.append("yearBuilt", formData.yearBuilt.toString());
    form.append("status", formData.status);
    form.append("blockchainId", tokenId);

    features.forEach((f) => form.append("features[]", f));
    images.forEach((img) => form.append("images", img.file)); // 'images' matches multer field

    // Step 3: Submit using context
    await submitProperty(form);

    toast({
      title: "Property Listed",
      description: "Your property is now live on LandLedger.",
    });

    // Reset form
    setFormData({
      title: "",
      description: "",
      location: "",
      price: 0,
      squareFootage: 0,
      bedrooms: 0,
      bathrooms: 0,
      yearBuilt: 0,
      status: "Available",
      imageUrls: [],
    });
    setImages([]);
    setFeatures([]);
    setTimeout(() => navigate("/properties"), 1500);

  } catch (error) {
    console.error("❌ Error during handleSubmit:", error);
    toast({
      title: "Submission Failed",
      description: "There was an error submitting the property. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   if (!formData.title || !formData.location || !formData.price || !formData.squareFootage || !formData.bedrooms || !formData.bathrooms || !formData.yearBuilt) {
  //     toast({
  //       title: "Missing Information",
  //       description: "Please fill in all required fields.",
  //       variant: "destructive",
  //     });
  //     setIsLoading(false);
  //     return;
  //   }

  //   try {
  //     const { propertyContract,signer } = await getContracts();
  //     // const signer = propertyContract.runner;
  //     const signerAddress = await signer.getAddress();
  //     const tokenURI = `https://landledger-metadata.com/dummy/${Date.now()}`
  //     // console.log(signerAddress)

  //     const tx = await propertyContract.createProperty(
  //       signerAddress,
  //       tokenURI, // tokenURI
  //       formData.location,
  //       ethers.parseEther(formData.price.toString()),
  //       formData.squareFootage,
  //       formData.bedrooms,
  //       formData.bathrooms,
  //       formData.yearBuilt
  //     );
  //     const receipt = await tx.wait();

  //     const tokenId = await receipt.logs
  //     .map((log: any) => {
  //       try {
  //         return propertyContract.interface.parseLog(log);
  //       } catch {
  //         return null;
  //       }
  //     })
  //     .find((parsed: any) => parsed && parsed.name === "PropertyListed")?.args?.tokenId?.toString();

  //     if (!tokenId) {
  //       throw new Error("Token ID not found in logs");
  //     }


  //     const uploadForm = new FormData();
  //     images.forEach((img) => {
  //       uploadForm.append('images',img.file)
  //     });

  //     const imageRes = await fetch("http://localhost:5000/api/property/upload-images",{
  //       method:"POST",
  //       headers:{
  //         "auth-token":localStorage.getItem('token')
  //       },
  //       body:uploadForm,
  //     })

  //     const {imageUrls} = await imageRes.json();
  //     if(!imageUrls|| !Array.isArray(imageUrls)){
  //       throw new Error("Image upload failed or did not return image URLs");
  //     }




  //     const propertyDetails = await fetchPropertyFromChain(tokenId);
  //     console.log("Fetched Property Details: ", propertyDetails);
  //     await submitProperty({
  //       ...formData,
  //       blockchainId:tokenId,
  //       features: features,
  //       imageUrl: imageUrl,
  //     });
      
  //     toast({
  //       title: "Property Listed",
  //       description: "Your property is now live on LandLedger.",
  //     });
  
  //     // Reset form after success
  //     setFormData({
  //       title: "",
  //       description: "",
  //       location: "",
  //       price: 0,
  //       squareFootage: 0,
  //       bedrooms: 0,
  //       bathrooms: 0,
  //       yearBuilt: 0,
  //       status: "Available",
  //     });
  //     setFeatures([]);
  //     // setImageUrl([]);
  
  //     // Redirect after short delay
  //     setTimeout(() => {
  //       navigate("/properties");
  //     }, 1500);
  
  //   } catch (error) {
  //     toast({
  //       title: "Submission Failed",
  //       description: "There was an error submitting the property. Please try again.",
  //       variant: "destructive",
  //     });
  //     console.log("❌ Error during handleSubmit:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   if (!title || !location || !price || !sqft || !bedrooms || !bathrooms || !yearBuilt) {
  //     toast({
  //       title: "Missing Information",
  //       description: "Please fill in all required fields.",
  //       variant: "destructive",
  //     });
  //     setIsLoading(false);
  //     return;
  //   }

  //   try {
  //     // Upload images to cloud first and get URLs
  //     const uploadedImageUrls: string[] = await Promise.all(
  //       images.map(async (img) => {
  //         const formData = new FormData();
  //         formData.append("file", img.file);
  //         formData.append("upload_preset", "your_upload_preset"); // for Cloudinary
  //         const res = await fetch("https://api.cloudinary.com/v1_1/<cloud_name>/image/upload", {
  //           method: "POST",
  //           body: formData,
  //         });
  //         const data = await res.json();
  //         return data.secure_url;
  //       })
  //     );

  //     await submitProperty({
  //       title,
  //       description,
  //       location,
  //       price: parseFloat(price),
  //       squareFootage: parseInt(sqft),
  //       bedrooms: parseInt(bedrooms),
  //       bathrooms: parseFloat(bathrooms),
  //       yearBuilt: parseInt(yearBuilt),
  //       status,
  //       features,
  //       imageUrls: uploadedImageUrls,
  //     });

  //     toast({
  //       title: "Property Listed",
  //       description: "Your property is now live on BlockHome Vista.",
  //     });

  //     // reset form here if needed
  //   } catch (error) {
  //     console.error(error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to list property.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   // Validate form
  //   if (!title || !location || !price || !sqft || !bedrooms || !bathrooms || !yearBuilt) {
  //     toast({
  //       title: "Missing Information",
  //       description: "Please fill in all required fields.",
  //       variant: "destructive",
  //     });
  //     setIsLoading(false);
  //     return;
  //   }

  //   // Simulate API call to submit property
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     toast({
  //       title: "Property Listed Successfully",
  //       description: "Your property is now live on BlockHome Vista.",
  //     });

  //     // In a real application, we would redirect to the property page
  //     // or clean the form for a new listing
  //   }, 1500);
  // };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-estate-primary">List Your Property</h1>
            <p className="mt-2 text-gray-600">
              Complete the form below to list your property on the blockchain.
            </p>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Property Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        Property Title*
                      </Label>
                      <Input
                        name="title"
                        id="title"
                        placeholder="e.g. Modern Downtown Apartment"
                        // value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        Location*
                      </Label>
                      <Input
                        name="location"
                        id="location"
                        placeholder="e.g. 123 Main St, City, State"
                        // value={formData.location}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Price (ETH)*
                      </Label>
                      <Input
                        name="price"
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 25.5"
                        // value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Property Status*</Label>
                      <Select
                        name="status"
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="UnderContract">Under Contract</SelectItem>
                            <SelectItem value="Sold">Sold</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Property Description</Label>
                    <Textarea
                      name="description"
                      id="description"
                      placeholder="Describe your property..."
                      className="min-h-[100px]"
                      // value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <Separator />

                {/* Property Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Property Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sqft" className="flex items-center">
                        <Ruler className="mr-2 h-4 w-4" />
                        Square Footage*
                      </Label>
                      <Input
                        name="squareFootage"
                        id="sqft"
                        type="number"
                        min="0"
                        placeholder="e.g. 1200"
                        // value={formData.squareFootage}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms" className="flex items-center">
                        <Bed className="mr-2 h-4 w-4" />
                        Bedrooms*
                      </Label>
                      <Input
                        name="bedrooms"
                        id="bedrooms"
                        type="number"
                        min="0"
                        placeholder="e.g. 3"
                        // value={formData.bedrooms}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms" className="flex items-center">
                        <Bath className="mr-2 h-4 w-4" />
                        Bathrooms*
                      </Label>
                      <Input
                        name="bathrooms"
                        id="bathrooms"
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="e.g. 2"
                        // value={formData.bathrooms}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearBuilt" className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Year Built*
                      </Label>
                      <Input
                        name="yearBuilt"
                        id="yearBuilt"
                        type="number"
                        min="1800"
                        max="4000"
                        placeholder={`e.g. ${new Date().getFullYear() - 5}`}
                        // value={formData.yearBuilt}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Property Features</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="e.g. Pool, Garage, Fireplace"
                        value={currentFeature}
                        onChange={(e) => setCurrentFeature(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addFeature}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 px-3 py-1 rounded-full flex items-center text-sm"
                        >
                          {feature}
                          <button
                            type="button"
                            className="ml-2 text-gray-500 hover:text-red-500"
                            onClick={() => removeFeature(feature)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Property Images Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Property Images</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Label>Upload Images</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-center">
                        <label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-32 cursor-pointer"
                        >
                          <Upload className="h-10 w-10 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                          <input
                            id="image-upload"
                            type="file"
                            multiple
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                        {images.map((image) => (
                          <div
                            key={image.id}
                            className="relative aspect-square overflow-hidden rounded-md"
                          >
                            <img
                              src={image.preview}
                              alt="Property preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md text-gray-700 hover:text-red-500"
                              onClick={() => removeImage(image.id)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-estate-primary hover:bg-estate-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Listing Property..." : "List Property"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellProperty;
