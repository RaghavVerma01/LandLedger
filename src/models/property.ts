
export interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  images: string[];
  status: "Available" | "UnderContract" | "Sold";
  seller: {
    id: number;
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  features: string[];
}

// Mock data for development purposes
export const mockProperties: Property[] = [
  {
    id: 1,
    title: "Modern Penthouse with City Views",
    description: "Luxurious penthouse with panoramic views of the city skyline. Features high-end finishes, open concept living, and a private rooftop terrace perfect for entertaining.",
    location: "Downtown, Crypto City",
    price: 56.8,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 2100,
    yearBuilt: 2020,
    images: ["/assets/modern-penthouse.jpg"],
    status: "Available",
    seller: {
      id: 101,
      name: "Alex Johnson",
      email: "alex@blockhomevista.com",
      phone: "(555) 123-4567",
      profileImage: "/seller1.jpg"
    },
    features: ["Rooftop Terrace", "Floor-to-ceiling Windows", "Smart Home System", "Concierge Service", "Gym Access"]
  },
  {
    id: 2,
    title: "Suburban Family Home",
    description: "Spacious family home in a quiet suburban neighborhood. Features a large backyard, updated kitchen, and finished basement. Perfect for families looking for space and comfort.",
    location: "Greenfield Suburb, Crypto City",
    price: 32.5,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    yearBuilt: 2015,
    images: ["/assets/suburban home.jpg"],
    status: "UnderContract",
    seller: {
      id: 102,
      name: "Sarah Williams",
      email: "sarah@blockhomevista.com",
      phone: "(555) 234-5678",
      profileImage: "/seller2.jpg"
    },
    features: ["Finished Basement", "Backyard Patio", "Updated Kitchen", "Attached Garage", "Home Office"]
  },
  {
    id: 3,
    title: "Historic Downtown Loft",
    description: "Converted loft in a historic building with original brick walls and industrial details. Features high ceilings, exposed ductwork, and large windows that flood the space with natural light.",
    location: "Arts District, Crypto City",
    price: 28.9,
    bedrooms: 1,
    bathrooms: 2,
    sqft: 1500,
    yearBuilt: 1920,
    images: ["/assets/downtown loft.jpg"],
    status: "Available",
    seller: {
      id: 103,
      name: "David Chen",
      email: "david@blockhomevista.com",
      phone: "(555) 345-6789",
      profileImage: "/seller3.jpg"
    },
    features: ["Exposed Brick", "High Ceilings", "Original Hardwood Floors", "Large Windows", "Industrial Kitchen"]
  },
  {
    id: 4,
    title: "Waterfront Contemporary Villa",
    description: "Stunning waterfront property with minimalist design and high-end finishes. Features walls of glass, open living spaces, and direct water access. Perfect for lovers of modern architecture.",
    location: "Lakeside, Crypto City",
    price: 78.3,
    bedrooms: 5,
    bathrooms: 4.5,
    sqft: 4200,
    yearBuilt: 2022,
    images: ["/assets/waterfront villa.jpg"],
    status: "Available",
    seller: {
      id: 104,
      name: "Emily Rodriguez",
      email: "emily@blockhomevista.com",
      phone: "(555) 456-7890",
      profileImage: "/seller4.jpg"
    },
    features: ["Private Dock", "Infinity Pool", "Smart Home System", "Wine Cellar", "Theater Room"]
  },
  {
    id: 5,
    title: "Mountain View Cabin",
    description: "Cozy cabin retreat with stunning mountain views. Features wood interior, stone fireplace, and large deck perfect for enjoying the outdoors.",
    location: "Mountain Ridge, Crypto County",
    price: 18.7,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1100,
    yearBuilt: 1985,
    images: ["/assets/mountainviewcabin.jpg"],
    status: "Sold",
    seller: {
      id: 105,
      name: "Michael Brown",
      email: "michael@blockhomevista.com",
      phone: "(555) 567-8901",
      profileImage: "/seller5.jpg"
    },
    features: ["Stone Fireplace", "Large Deck", "Hot Tub", "Private Trail Access", "Updated Kitchen"]
  },
  {
    id: 6,
    title: "Urban Micro Apartment",
    description: "Efficiently designed micro apartment in the heart of the city. Features clever storage solutions and modern design to maximize the compact space.",
    location: "Tech District, Crypto City",
    price: 12.4,
    bedrooms: 0,
    bathrooms: 1,
    sqft: 450,
    yearBuilt: 2021,
    images: ["/assets/microapartment.jpg"],
    status: "Available",
    seller: {
      id: 106,
      name: "Jessica Martinez",
      email: "jessica@blockhomevista.com",
      phone: "(555) 678-9012",
      profileImage: "/seller6.jpg"
    },
    features: ["Murphy Bed", "Foldable Furniture", "Built-in Storage", "Communal Roof Deck", "Bike Storage"]
  }
];
