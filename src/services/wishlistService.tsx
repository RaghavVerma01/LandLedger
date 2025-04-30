const API_URL = "http://localhost:5000/api/wishlist";

// src/types/WishlistItem.ts
export interface WishlistItem {
    _id: string;
    userId: string;
    property: {
      name: string;
      location: string;
      price: string;
      type: string;
      size: string;
      bedrooms: number;
      bathrooms: number;
    };
  }
  

export const fetchwishlist = async() : Promise<WishlistItem[]> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/fetchWishlist`, {
        method:"GET",
        headers: {
            "auth-token": `${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.json();
}
export const addwishlist = async(WishlistItem: WishlistItem) : Promise<WishlistItem[]> => {
    const token = localStorage.getItem("token");
    console.log(token);
    const response = await fetch(`${API_URL}/addWishlist`, {
        method:"POST",
        headers: {
            "auth-token": `${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(WishlistItem),
    });
    return response.json();
}
  