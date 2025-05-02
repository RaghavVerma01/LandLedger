import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Shield, Database, Zap, Home, Building, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { mockProperties } from "@/models/property";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const featuredProperties = mockProperties.slice(0, 3);
  const testimonials = [
    {
      name: "Sophie Anderson",
      role: "Homeowner",
      content: "LandLedger made selling my property so easy. The blockchain verification gave buyers confidence and I received multiple offers within days!",
    },
    {
      name: "Michael Johnson",
      role: "Real Estate Investor",
      content: "As someone who invests in properties regularly, the transparency LandLedger provides is invaluable. No more worrying about hidden issues or title problems.",
    },
    {
      name: "Emma Williams",
      role: "First-time Buyer",
      content: "I never thought buying my first home would be this straightforward. The blockchain technology simplified everything and I felt secure throughout the process.",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-estate-dark to-estate-primary text-white py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-0"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight animate-fade-in">
                Real Estate Reimagined Through Blockchain Technology
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-100 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Secure, transparent, and efficient property transactions powered by blockchain. Experience the future of real estate with LandLedger.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Link to="/properties">
                  <Button size="lg" className="bg-estate-secondary hover:bg-estate-secondary/90 text-white w-full sm:w-auto">
                    Browse Properties
                  </Button>
                </Link>
                <Link to="/sell">
                  <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/20 hover:text-white w-full sm:w-auto">
                    List Your Property
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-10 bg-white shadow-lg -mt-6 relative z-10 rounded-t-lg mx-4 sm:mx-8 lg:mx-auto max-w-6xl">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Properties
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-estate-accent" size={18} />
                  <Input
                    id="search"
                    type="text"
                    placeholder="City, neighborhood, or address"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Link to="/properties" className="md:flex-none">
                <Button className="w-full md:w-auto bg-estate-primary hover:bg-estate-primary/90 text-white">
                  Search Properties
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-16 bg-estate-tertiary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-estate-primary">Featured Properties</h2>
              <Link to="/properties" className="text-estate-secondary flex items-center hover:underline font-medium">
                View All <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  title={property.title}
                  location={property.location}
                  price={property.price}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  sqft={property.sqft}
                  yearBuilt={property.yearBuilt}
                  imageUrl={property.images[0] || "/placeholder-property.jpg"}
                  status={property.status}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Property Showcase Carousel */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-estate-dark mb-4">Discover Our Prime Properties</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse through our exclusive selection of blockchain-verified properties from around the world.
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto px-8">
              <Carousel
                opts={{
                  align: "center",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {mockProperties.slice(0, 6).map((property, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 h-80">
                      <div className="h-full p-1">
                        <Link to={`/property/${property.id}`} className="block h-full overflow-hidden rounded-xl relative group">
                          <img 
                            src={`${property.images[0]}`} 
                            alt={property.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80"></div>
                          <div className="absolute bottom-0 left-0 p-4 text-white">
                            <h3 className="font-semibold text-lg">{property.title}</h3>
                            <p className="text-sm opacity-90">{property.location}</p>
                            <p className="font-bold mt-1">{property.price} ETH</p>
                          </div>
                        </Link>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 bg-white/70 hover:bg-white" />
                <CarouselNext className="right-0 bg-white/70 hover:bg-white" />
              </Carousel>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gradient-to-b from-white to-estate-tertiary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-estate-dark mb-4">Why Choose LandLedger</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our blockchain-powered platform brings transparency, security, and efficiency to real estate transactions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="bg-estate-tertiary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-estate-primary" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Secure Transactions</h3>
                <p className="text-gray-600 text-center">
                  Smart contracts ensure secure and tamper-proof property transactions without traditional intermediaries.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="bg-estate-tertiary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Database className="text-estate-primary" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Immutable Records</h3>
                <p className="text-gray-600 text-center">
                  Property history and ownership records securely stored on the blockchain, eliminating fraud concerns.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="bg-estate-tertiary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-estate-primary" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Fast Settlements</h3>
                <p className="text-gray-600 text-center">
                  Close property deals in days instead of weeks with our streamlined blockchain process.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-estate-dark text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Join thousands of satisfied buyers and sellers who have transformed their real estate experience with blockchain technology.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-estate-primary/50 backdrop-blur-sm p-6 rounded-xl">
                  <div className="flex flex-col h-full">
                    <div className="flex-grow">
                      <p className="italic text-gray-200 mb-6">"{testimonial.content}"</p>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-estate-secondary">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-estate-tertiary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Home className="text-estate-primary" size={28} />
                </div>
                <p className="text-4xl font-bold text-estate-primary mb-2">1,500+</p>
                <p className="text-gray-600">Properties Listed</p>
              </div>
              <div className="text-center p-6">
                <div className="bg-estate-tertiary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Building className="text-estate-primary" size={28} />
                </div>
                <p className="text-4xl font-bold text-estate-primary mb-2">750+</p>
                <p className="text-gray-600">Successful Transactions</p>
              </div>
              <div className="text-center p-6">
                <div className="bg-estate-tertiary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Hash className="text-estate-primary" size={28} />
                </div>
                <p className="text-4xl font-bold text-estate-primary mb-2">0%</p>
                <p className="text-gray-600">Fraud Rate with Blockchain</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-estate-primary to-estate-dark text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Real Estate Experience?</h2>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Join the blockchain revolution in real estate. Create an account today to buy, sell, or invest in properties.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup">
                <Button size="lg" className="bg-estate-secondary hover:bg-estate-secondary/90 text-white w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link to="/properties">
                <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/20 hover:text-white w-full sm:w-auto">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
