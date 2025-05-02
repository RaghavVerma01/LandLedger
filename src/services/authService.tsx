const API_URL = "http://localhost:5000/api/auth";

interface UserData {
    name?: string;  
    username: string;
    password: string;
}

interface AuthResponse {
    authToken?: string;
    error?: string;
}

export const signup = async (userData: UserData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/createuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
  
      if (!response.ok) {
        // Handle non-2xx responses (e.g., 400 for username exists, validation errors)
        const errorData = await response.json();
        return { authToken: null, error: errorData.error || JSON.stringify(errorData.errors) || `Signup failed with status ${response.status}` };
      }
  
      const data = await response.json();
      console.log("This is data: ",data);
      return { authToken: data.authToken, error: null };
    } catch (error) {
      console.error("Error during signup fetch:", error);
      return { authToken: null, error: "Network error during signup." };
    }
  };

export const login = async (credentials: UserData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (data.authToken) {
        localStorage.setItem("token", data.authToken);
    }
    return data;
};

// ✅ Fix: Ensure getUser is properly defined
export const getUser = async (): Promise<any> => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${API_URL}/getuser`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    return response.json();
};

// ✅ Fix: Ensure logout function exists
export const logout = (): void => {
    localStorage.removeItem("token");
    
};
