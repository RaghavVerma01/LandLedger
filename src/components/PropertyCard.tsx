
import { Building, MapPin, Bath, Bed, Calendar, Maximize } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PropertyCardProps {
  id: number;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  imageUrl: string;
  status: "Available" | "UnderContract" | "Sold";
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  sqft,
  yearBuilt,
  imageUrl,
  status,
}: PropertyCardProps) => {
  const statusColors = {
    Available: "bg-green-100 text-green-800",
    UnderContract: "bg-amber-100 text-amber-800",
    Sold: "bg-red-100 text-red-800",
  };

  return (
    <Link to={`/property/${id}`}>
      <Card className="property-card overflow-hidden h-full">
        <div className="relative h-48">
          <img
            src={imageUrl || "/placeholder-property.jpg"}
            alt={title}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-3 right-3">
            <Badge className={statusColors[status]}>
              {status}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg truncate">{title}</h3>
          <div className="flex items-center text-gray-500 mt-1">
            <MapPin size={14} className="mr-1" />
            <p className="text-sm truncate">{location}</p>
          </div>
          <p className="font-bold text-lg text-estate-primary mt-2">
            {price} ETH
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center text-gray-500">
              <Bed size={16} className="mr-1" />
              <span className="text-sm">{bedrooms} Beds</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Bath size={16} className="mr-1" />
              <span className="text-sm">{bathrooms} Baths</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Maximize size={16} className="mr-1" />
              <span className="text-sm">{sqft} sqft</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Calendar size={16} className="mr-1" />
              <span className="text-sm">{yearBuilt}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;
