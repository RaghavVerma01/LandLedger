
import { useEffect, useState } from "react";
import { usePropertyContext } from "@/contexts/propertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { mockProperties } from "@/models/property";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal, X } from "lucide-react";

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [bedroomsFilter, setBedroomsFilter] = useState<string>("any");
  const [bathroomsFilter, setBathroomsFilter] = useState<string>("any");
  const [statusFilter, setStatusFilter] = useState<string>("any");
  const [showFilters, setShowFilters] = useState(false);

  const { properties, fetchProperties, loading, error, deleteProperty } = usePropertyContext();
  useEffect(()=>{
    fetchProperties();
  },[]);
  console.log("All listed properties");
  console.log("Properties: ",properties);
  // Filter properties based on search and filter criteria
  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());


    const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];

    const matchesBedrooms = bedroomsFilter === "any" ||
      (bedroomsFilter === "4+" && property.bedrooms >= 4) ||
      (property.bedrooms.toString() === bedroomsFilter);

    const matchesBathrooms = bathroomsFilter === "any" ||
      (bathroomsFilter === "4+" && property.bathrooms >= 4) ||
      (property.bathrooms.toString() === bathroomsFilter);

    const matchesStatus = statusFilter === "any" || property.status === statusFilter;
    return matchesSearch && matchesPrice && matchesBedrooms && matchesBathrooms && matchesStatus;
  });
  console.log('filteredproperties: ',filteredProperties)
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-estate-primary mb-8">Properties</h1>

          {/* Search and filter bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search by location, property name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="md:w-auto flex items-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} className="mr-2" />
                Filters
              </Button>
            </div>

            {/* Expandable filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Filters</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowFilters(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (ETH)
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <span>{priceRange[0]}</span>
                      <Slider
                        defaultValue={[0, 100]}
                        min={0}
                        max={100}
                        step={1}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value)}
                        className="flex-grow"
                      />
                      <span>{priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4+">4+</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms
                    </label>
                    <Select value={bathroomsFilter} onValueChange={setBathroomsFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4+">4+</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Status
                    </label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="UnderContract">Under Contract</SelectItem>
                          <SelectItem value="Sold">Sold</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Property listings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <PropertyCard
                  // key={property.id}
                  id={property._id}
                  title={property.title}
                  location={property.location}
                  price={property.price}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  sqft={property.squareFootage}
                  yearBuilt={property.yearBuilt}
                  imageUrl={property.imageUrls[0] || "/placeholder-property.jpg"}
                  status={property.status}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-gray-500">No properties match your search criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setPriceRange([0, 2000]);
                    setBedroomsFilter("any");
                    setBathroomsFilter("any");
                    setStatusFilter("any");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Properties;
