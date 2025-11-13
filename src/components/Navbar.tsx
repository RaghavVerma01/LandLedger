
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletContext } from "@/contexts/WalletContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "../services/authService";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Navbar = () => {
  const { bindWallet } = useContext(WalletContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in by looking for token
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Check if wallet was previously connected
    const savedAccount = localStorage.getItem("walletAddress");
    if (savedAccount) {
      setAccount(savedAccount);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setAccount(null);
    localStorage.removeItem('walletAddress');
    setIsLoggedIn(false);
    navigate("/");
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask browser extension to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      const message = `Sign to link your wallet: ${address}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      })

      // Backend interaction using a fetch API

      await bindWallet(address, signature);
      setAccount(address);
      localStorage.setItem("walletAddress", address);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setAccount(null);
          localStorage.removeItem("walletAddress");
        } else {
          setAccount(accounts[0]);
          localStorage.setItem("walletAddress", accounts[0]);
        }
      });
    } catch (error) {
      console.error("Error connecting to MetaMask", error);
      if (error.status === 400 || error.status === 403) {

        toast({
          title: "Wallet Mismatch",
          description: "This wallet does not belong to your account. Please use the correct one.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Error",
          description: "Failed to connect to your wallet",
          variant: "destructive",
        });
      }
    }


  };

  const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem("walletAddress");
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-estate-primary text-xl font-bold">Land</span>
              <span className="text-estate-secondary text-xl font-bold">Ledger</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/" className="text-gray-700 hover:text-estate-secondary px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link to="/properties" className="text-gray-700 hover:text-estate-secondary px-3 py-2 rounded-md text-sm font-medium">
                Properties
              </Link>
              <div className="relative group">
                <button className="text-gray-700 hover:text-estate-secondary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <span>Services</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>

                <div className="absolute z-10 left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-150 ease-in-out 
                  pointer-events-auto">
                  <div className="py-1">
                    <Link to="/sell" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      List Property
                    </Link>
                    <Link to="/payment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Escrow Payment
                    </Link>
                  </div>
                </div>
              </div>

              <Link to="/aipredict" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-estate-secondary">
                AI Prediction
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-estate-secondary px-3 py-2 rounded-md text-sm font-medium">
                About
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                {!account ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={connectWallet}>
                        <div className="flex items-center">
                          <img
                            src="\assets\metamask.png"
                            alt="MetaMask"
                            className="mr-2 h-4 w-4"
                          />
                          <span>Connect Wallet</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex items-center">
                          <Link to="/sellerdashboard">Seller Dashboard</Link>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <div className="flex items-center text-red-500">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                    className="flex items-center gap-2"
                    title={account}
                  >
                    <img
                      src="\assets\metamask.png"
                      alt="Connected Wallet"
                      className="mr-1 h-4 w-4"
                    />
                    {account.substring(0, 6)}...{account.substring(account.length - 4)}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                  className="text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-gray-600">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-estate-secondary">
                Home
              </Link>
              <Link to="/properties" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-estate-secondary">
                Properties
              </Link>
              <div className="relative">
                <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-estate-secondary">
                  Services
                </button>
                <div className="pl-6 space-y-1">
                  <Link to="/sell" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-estate-secondary">
                    List Property
                  </Link>
                  <Link to="/payment" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-estate-secondary">
                    Escrow Payment
                  </Link>
                </div>
              </div> 
              <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-estate-secondary">
                About
              </Link>
              {isLoggedIn && (
                <>
                  <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-estate-secondary">
                    Profile
                  </Link>
                  <button
                    onClick={account ? disconnectWallet : connectWallet}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-estate-secondary"
                  >
                    <img
                      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMTIiIGhlaWdodD0iMTg5IiB2aWV3Qm94PSIwIDAgMjEyIDE4OSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cG9seWdvbiBmaWxsPSIjQ0RCREIyIiBwb2ludHM9IjYwLjc1IDE3My4yNSA4OC4zMTMgMTgwLjU2MyA4OC4zMTMgMTcxIDkwLjU2MyAxNjguNzUgMTA2LjMxMyAxNjguNzUgMTA2LjMxMyAxODAgMTA2LjMxMyAxODcuODc1IDE2Mi41NjMgMTczLjI1IDkyLjgxMyAxNTIuNDM4IDQ5LjUgMTQwLjYyNSIvPjxwb2x5Z29uIGZpbGw9IiM2NDNGMzEiIHBvaW50cz0iNDkuNSAxNDAuNjI1IDE1MS44MTMgMTUyLjQzOCAxNjAuMzEzIDE3My4yNSA5Mi44MTMgMTUyLjQzOCIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjA5LjgxMyAwKSIvPjxwb2x5Z29uIGZpbGw9IiM2NTM1MjMiIHBvaW50cz0iOTQuNSAxNDYuODc1IDk0LjUgMTIzLjM3NSAxMDEuMjUgMTMwLjEyNSAxMzcuMjUgMTI4LjI1IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyMzEuNzUgMCkiLz48cG9seWdvbiBmaWxsPSIjNjQzRjMxIiBwb2ludHM9IjEwNi4zMTMgMTIzLjM3NSA5NC41IDEyMy4zNzUgOTQuNSAxNDAuNjI1IDEzNy4yNSAxMjguMjUiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMjYzLjYyNSkiLz48cG9seWdvbiBmaWxsPSIjNjQzRjMxIiBwb2ludHM9IjEzNy4yNSAxMjguMjUgOTAuNTYzIDE0MC42MjUgMTA2LjMxMyAxMjMuMzc1IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyMjcuODEzIDApIi8+PHBvbHlnb24gZmlsbD0iIzNCMyIgcG9pbnRzPSI0OS41IDE0MC42MjUgOTAuNTYzIDE0MC42MjUgOTQuNSAxNDYuODc1IiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDI4Ny41KSIvPjwvcG9seWdvbj48cG9seWdvbiBmaWxsPSIjQ0Q2RDIzIiBwb2ludHM9IjQ5LjUgMTQwLjYyNSA2MC43NSAxNzMuMjUgOTAuNTYzIDE0MC42MjUiLz48cG9seWdvbiBmaWxsPSIjQ0Q2RDIzIiBwb2ludHM9Ijk0LjUgMTQ2Ljg3NSA5MC41NjMgMTQwLjYyNSAxMzcuMjUgMTQwLjYyNSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjI3LjgxMyAwKSIvPjxwb2x5Z29uIGZpbGw9IiNDRDZEMjMiIHBvaW50cz0iOTAuNTYzIDE0MC42MjUgOTIuODEzIDE1Mi40MzggMTYyLjU2MyAxNzMuMjUiLz48cG9seWdvbiBmaWxsPSIjQ0RCREIyIiBwb2ludHM9IjYwLjc1IDE3My4yNSA5MC41NjMgMTQwLjYyNSA5Mi44MTMgMTUyLjQzOCIvPjxwb2x5Z29uIGZpbGw9IiM2NTM1MjMiIHBvaW50cz0iMTM3LjI1IDEyOC4yNSA5NC41IDEzNS4zNzUgOTAuNTYzIDE0MC42MjUgOTQuNSAxNDYuODc1IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyMjcuODEzIDApIi8+PHBvbHlnb24gZmlsbD0iI0NENkQyMyIgcG9pbnRzPSIxMzcuMjUgMTQwLjYyNSAxNjIuNTYzIDE3My4yNSA5NC41IDE0Ni44NzUiIHRyYW5zZm9ybT0ibWF0cml4KC0xIDAgMCAxIDI1Ny4wNjMgMCkiLz48cG9seWdvbiBmaWxsPSIjQjkyRjIxIiBwb2ludHM9Ijk0LjUgMTQ2Ljg3NSAxNTEuODEzIDE1Mi40MzggMTYyLjU2MyAxNzMuMjUiIHRyYW5zZm9ybT0ibWF0cml4KC0xIDAgMCAxIDI1Ny4wNjMgMCkiLz48cG9seWdvbiBmaWxsPSIjQ0Q2RDIzIiBwb2ludHM9IjYwLjc1IDE3My4yNSA5Mi44MTMgMTUyLjQzOCA4OC4zMTMgMTgwLjU2MyIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAzMzMuODEzKSIvPjxwb2x5Z29uIGZpbGw9IiNCOTJGMjEiIHBvaW50cz0iOTIuODEzIDE1Mi40MzggODguMzEzIDE4MC41NjMgMTA2LjMxMyAxODciIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMzM5LjQzOCkiLz48cG9seWdvbiBmaWxsPSIjQjkyRjIxIiBwb2ludHM9IjkwLjU2MyAxNDAuNjI1IDk0LjUgMTI4LjI1IDEwNi4zMTMgMTIzLjM3NSIvPjxwb2x5Z29uIGZpbGw9IiNDREJEQjIiIHBvaW50cz0iNjAuNzUgMTczLjI1IDg4LjMxMyAxODAuNTYzIDg4LjMxMyAxNzEiLz48cG9seWdvbiBmaWxsPSIjNjQzRjMxIiBwb2ludHM9IjYwLjc1IDE3My4yNSA3NC4yNSAxNzEgODguMzEzIDE3MSIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAzNDQpIi8+PHBvbHlnb24gZmlsbD0iIzY0M0YzMSIgcG9pbnRzPSI4OC4zMTMgMTcxIDc0LjI1IDE2OC43NSA5MC41NjMgMTY4Ljc1IiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDMzOS43NSkiLz48cG9seWdvbiBmaWxsPSIjNjQzRjMxIiBwb2ludHM9Ijg4LjMxMyAxODAuNTYzIDEwNi4zMTMgMTgwLjU2MyAxMDYuMzEzIDE4Ny44NzUiIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgMzY4LjQzOCkiLz48cG9seWdvbiBmaWxsPSIjNjQzRjMxIiBwb2ludHM9Ijg4LjMxMyAxODAuNTYzIDg4LjMxMyAxODcuODc1IDEwNi4zMTMgMTg3Ljg3NSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMTk0LjYyNiAwKSIvPjxwb2x5Z29uIGZpbGw9IiMzMzMiIHBvaW50cz0iOTQuNSAxMjguMjUgOTQuNSAxMjMuMzc1IDEwNi4zMTMgMTIzLjM3NSIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAyNTEuNjI1KSIvPjxwb2x5Z29uIGZpbGw9IiNDREJEQjIiIHBvaW50cz0iMTUxLjgxMyAxNTIuNDM4IDE2Mi41NjMgMTczLjI1IDE2Mi41NjMgMTc3LjUgMjExLjUgMTQwLjYyNSAxMDYuMzEzIDEyMy4zNzUgOTAuNTYzIDE0MC42MjUgMTM3LjI1IDE0MC42MjUiLz48cG9seWdvbiBmaWxsPSIjQ0RCREIyIiBwb2ludHM9IjQ5LjUgMTQwLjYyNSAwIDE0MC42MjUgNjAuNzUgMTczLjI1IDkwLjU2MyAxNDAuNjI1IDk0LjUgMTI4LjI1IDEwNi4zMTMgMTIzLjM3NSIvPjxwb2x5Z29uIGZpbGw9IiNCMjk3NEIiIHBvaW50cz0iMTA2LjMxMyAxMjMuMzc1IDIxMS41IDE0MC42MjUgMjAyLjUgODUuNSAxNTcgNTYuMjUiLz48cG9seWdvbiBmaWxsPSIjNjQzRjMxIiBwb2ludHM9IjE2Mi41NjMgMTc3LjUgMTYyLjU2MyAxNzMuMjUgMjExLjUgMTQwLjYyNSIvPjxwb2x5Z29uIGZpbGw9IiNCMjk3NEIiIHBvaW50cz0iMCAxNDAuNjI1IDQ5LjUgOTAuNSA1NS4zMzMgOTguNSIvPjxwb2x5Z29uIGZpbGw9IiNCMjk3NEIiIHBvaW50cz0iNDkuNSA5NS42MjUgNDkuNSAxNDAuNjI1IDcuODc1IDE0MC42MjUiLz48cG9seWdvbiBmaWxsPSIjQ0RCREIyIiBwb2ludHM9IjYwLjc1IDE3My4yNSAwIDE0MC42MjUgNy45MjkgMTY0Ljc1MiIvPjxwb2x5Z29uIGZpbGw9IiNDREJEQjIiIHBvaW50cz0iMTYyLjU2MyAxNzcuNSAyMTEuNSAxNDAuNjI1IDIwMS43NSAxNjQuNzMyIi8+PHBvbHlnb24gZmlsbD0iI0IyOTc0QiIgcG9pbnRzPSI4My42OTctMy40MTggNDkuNSA5MC41IDAgNDUuMjUiLz48cG9seWdvbiBmaWxsPSIjQjI5NzRCIiBwb2ludHM9IjYwLjc1IDAgMjAyLjUgNDUuMjUgMTU3IDU2LjI1IDEwNi4zMTMgMTIzLjM3NSA5NC41IDEyOC4yNSA1NS4xMzUgMCIvPjxwb2x5Z29uIGZpbGw9IiNDMkEzNkEiIHBvaW50cz0iNTIuMzEzIDAgNTMuNzI5IDAgNTUuMTM1IDAgOTQuNSAxMjguMjUgNTUgOTkiLz48cG9seWdvbiBmaWxsPSIjQzJBMzZBIiBwb2ludHM9Ijc0LjUzIC00IDgzLjY5NyAtMy40MTggMCA0NS4yNSIvPjxwb2x5Z29uIGZpbGw9IiM2NDNGMzEiIHBvaW50cz0iOTAuNTYzIDE2OC43NSA3NC4yNSAxNjguNzUgOTAuNTYzIDE0MC42MjUiLz48cG9seWdvbiBmaWxsPSIjNjQzRjMxIiBwb2ludHM9IjkwLjU2MyAxNjguNzUgMTA2LjMxMyAxNjguNzUgMTA2LjMxMyAxODAiLz48cG9seWdvbiBmaWxsPSIjQzJBMzZBIiBwb2ludHM9IjYwLjc1IDAgNDkuNSA5NS42MjUgNDkuNSA5MC41IDgzLjY5NyAtMy40MTgiPjwvcG9seWdvbj48L2c+PC9zdmc+"
                      alt="MetaMask"
                      className="mr-2 h-5 w-5"
                    />
                    {account ? `Disconnect Wallet (${account.substring(0, 6)}...${account.substring(account.length - 4)})` : 'Connect Wallet'}
                  </button>
                  <button
                    onClick={account ? disconnectWallet : connectWallet}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-estate-secondary"
                  >
                    <Link to="/sellerdashboard">Seller Dashboard</Link>
                    
                  </button>
                  <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-500 hover:text-red-700">
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </button>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-estate-secondary">
                    Login
                  </Link>
                  <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-estate-secondary">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
