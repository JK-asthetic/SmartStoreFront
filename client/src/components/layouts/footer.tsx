import { Link } from "wouter";
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-12 pb-6">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">
              MODERN<span className="text-secondary">SHOP</span>
            </h3>
            <p className="text-white/70 mb-4">
              Your one-stop destination for modern, high-quality products at competitive prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-secondary">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-secondary">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-secondary">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/products?filter=new" className="hover:text-secondary">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?category=women" className="hover:text-secondary">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/products?category=men" className="hover:text-secondary">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-secondary">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/products?filter=sale" className="hover:text-secondary">
                  Sale
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/contact" className="hover:text-secondary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-secondary">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-secondary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-secondary">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-white/70">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-3 h-5 w-5" />
                <span>123 Fashion Street, City, Country</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-3 h-5 w-5" />
                <span>+1 234 567 890</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-3 h-5 w-5" />
                <span>info@modernshop.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} ModernShop. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link href="/privacy-policy" className="text-white/70 text-sm hover:text-secondary">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-white/70 text-sm hover:text-secondary">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="text-white/70 text-sm hover:text-secondary">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
