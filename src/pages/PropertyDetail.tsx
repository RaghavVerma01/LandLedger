
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Property } from "@/contexts/propertyContext";
// import { Property, mockProperties } from "@/models/property";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { buyProperty } from "@/utils/buyProperty";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  MapPin,
  Bath,
  Bed,
  Calendar,
  Maximize,
  User,
  Mail,
  Phone,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePropertyContext } from "@/contexts/propertyContext";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { properties } = usePropertyContext();
  // const fetchedProperties = async()=>{
  //   await properties;
  //   return properties;
  // }
  // console.log("properties: ",properties);
  // console.log("id: ",id);
  // console.log("property: ", property.seller);
  useEffect(() => {
    // Simulate API call to fetch property details
    const fetchProperty = () => {
      setLoading(true);
      if (!id) {
        console.error("❌ No property ID found in route params");
        return;
      }
      if (id && properties.length > 0) {
        const found = properties.find((p) => p._id === id);
        setProperty(found || null);
        console.log("found: ", found);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, properties]);

  const handleContactSeller = () => {
    // In a real app, this would open a contact form or messaging feature
    toast({
      title: "Contact Request Sent",
      description: "The seller will be notified of your interest.",
    });
  };

  const handleBuy = async () => {
  
  }
  const handlePurchase = () => {
    // In a real app, this would initiate the blockchain transaction
    toast({
      title: "Purchase Initiated",
      description: "Please connect your wallet to complete the transaction.",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <AlertCircle size={64} className="text-red-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the property you're looking for.
          </p>
          <Button asChild>
            <a href="/properties">Browse Other Properties</a>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const statusColors = {
    Available: "bg-green-100 text-green-800",
    UnderContract: "bg-amber-100 text-amber-800",
    Sold: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-estate-primary">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-500 mt-2">
                  <MapPin size={18} className="mr-1" />
                  <span>{property.location}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex items-center">
                <span className="text-3xl font-bold text-estate-primary mr-4">
                  {property.price} ETH
                </span>
                <Badge className={statusColors[property.status]}>
                  {property.status}
                </Badge>
              </div>
            </div>

            {/* Property Images Carousel */}
            {/* <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-8">
                {property.images.length >0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {property?.imageUrl.map((  image, index) => (
                        <CarouselItem key={index}>
                          <div className="h-[300px] md:h-[500px] w-full">
                            <img
                              src={image || "/placeholder-property.jpg"}
                              alt={`${property.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </Carousel>
                ) : (
                  <div className="h-[300px] md:h-[500px] w-full flex items-center justify-center bg-gray-200">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property Details */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Property Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                      <Bed className="text-estate-secondary mb-2" size={24} />
                      <span className="text-lg font-semibold">{property.bedrooms}</span>
                      <span className="text-sm text-gray-500">Bedrooms</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                      <Bath className="text-estate-secondary mb-2" size={24} />
                      <span className="text-lg font-semibold">{property.bathrooms}</span>
                      <span className="text-sm text-gray-500">Bathrooms</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                      <Maximize className="text-estate-secondary mb-2" size={24} />
                      <span className="text-lg font-semibold">{property.squareFootage}</span>
                      <span className="text-sm text-gray-500">Sq Ft</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar className="text-estate-secondary mb-2" size={24} />
                      <span className="text-lg font-semibold">{property.yearBuilt}</span>
                      <span className="text-sm text-gray-500">Year Built</span>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{property.description}</p>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {property.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <div className="h-2 w-2 bg-estate-secondary rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {property.status === "Available" && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Blockchain Details</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Clock size={16} className="mr-2 text-gray-500" />
                            <span className="text-sm text-gray-500">Listed on chain: April 12, 2023</span>
                          </div>
                          <p className="text-xs text-gray-500 font-mono mb-2 truncate">
                            Token ID: 0x7a69c0256e751e5c8a778db0b7b3bf96c8753135
                          </p>
                          <Button
                            className="w-full mt-2 bg-estate-secondary hover:bg-estate-secondary/80"
                            onClick={handlePurchase}
                          >
                            Purchase Property
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Seller Information */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Seller Information</h3>
                  <div className="flex items-center mb-6">
                    {/* <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden mr-4">
                        {property.seller.profileImage ? (
                          <img
                            src={property.seller.profileImage}
                            alt={property.seller.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-estate-primary text-white">
                            <User size={24} />
                          </div>
                        )}
                      </div> */}
                    {property?.seller ? (
                      <>
                        <div>
                        <h4 className="font-semibold">{property.seller.name}</h4>
                        <p className="text-sm text-gray-500">Property Seller</p>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-700">
                          <Mail size={16} className="mr-2 text-gray-500" />
                          <span>{property.seller.username}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Phone size={16} className="mr-2 text-gray-500" />
                          <span>{property.seller.phone}</span>
                        </div>
                      </div>
                      </>
                    ) : (
                      <div>
                        <p><strong>Seller:</strong> No information on seller</p>
                      </div>
                    )}
                    {/* <div>
                      <h4 className="font-semibold">{property.seller.name}</h4>
                      <p className="text-sm text-gray-500">Property Seller</p>
                    </div> */}
                  </div>

                  {/* <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <Mail size={16} className="mr-2 text-gray-500" />
                      <span>{property.seller.username}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone size={16} className="mr-2 text-gray-500" />
                      <span>{property.seller.phone}</span>
                    </div>
                  </div> */}

                  <Button
                    className="w-full"
                    onClick={handleContactSeller}
                    disabled={property.status === "Sold"}
                  >
                    Contact Seller
                  </Button>
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

export default PropertyDetail;
