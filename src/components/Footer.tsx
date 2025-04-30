
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-estate-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center mb-4">
                <span className="text-white text-xl font-bold">Land</span>
                <span className="text-estate-secondary text-xl font-bold">Ledger</span>
              </Link>
              <p className="text-sm text-gray-300 mb-6">
                Transforming real estate through blockchain technology. Secure, transparent, and efficient property transactions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-estate-secondary">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-300 hover:text-estate-secondary">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-gray-300 hover:text-estate-secondary">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-300 hover:text-estate-secondary">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/properties" className="text-gray-300 hover:text-estate-secondary">
                    Properties
                  </Link>
                </li>
                <li>
                  <Link to="/sell" className="text-gray-300 hover:text-estate-secondary">
                    List Property
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-estate-secondary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-estate-secondary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-estate-secondary">
                    Blockchain Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-estate-secondary">
                    ETH Wallet Setup
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-estate-secondary">
                    Smart Contracts
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-estate-secondary">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <address className="not-italic text-gray-300 space-y-2">
                <p>123 Blockchain Way</p>
                <p>Crypto City, CC 10101</p>
                <p className="mt-4">support@blockhomevista.com</p>
                <p>+1 (888) 123-4567</p>
              </address>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 py-6">
          <p className="text-center text-sm text-gray-300">
            © {new Date().getFullYear()} LandLedger. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
