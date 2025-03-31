import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Heart, User, Menu, Search, X } from "lucide-react";
import AuthModal from "@/components/modals/auth-modal";

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  isLoggedIn: boolean;
  onLoginStatusChange: (status: boolean) => void;
}

export default function Header({ 
  cartCount, 
  wishlistCount, 
  isLoggedIn, 
  onLoginStatusChange 
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register">("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const openLoginModal = () => {
    setAuthModalType("login");
    setIsAuthModalOpen(true);
  };
  
  const openRegisterModal = () => {
    setAuthModalType("register");
    setIsAuthModalOpen(true);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };
  
  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  return (
    <>
      <header className="bg-white shadow fixed w-full z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-primary font-poppins font-bold text-2xl">
                MODERN<span className="text-secondary">SHOP</span>
              </Link>
            </div>
            
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 mx-12">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  className="w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:border-accent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit"
                  variant="ghost" 
                  className="absolute right-0 top-0 mt-2 mr-4 text-gray-400"
                >
                  <Search size={18} />
                </Button>
              </form>
            </div>
            
            {/* Navigation Icons */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="relative hidden md:flex items-center mr-6 text-foreground hover:text-primary"
                asChild
              >
                <Link href="/products">
                  <span>Categories</span>
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                className="relative flex items-center mr-6 text-foreground hover:text-primary"
                onClick={openLoginModal}
              >
                <User className="mr-2 h-5 w-5" />
                <span className="hidden md:inline">Account</span>
              </Button>
              
              <Button
                variant="ghost"
                className="relative mr-6 text-foreground hover:text-primary p-2"
                asChild
              >
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                className="relative text-foreground hover:text-primary p-2"
                asChild
              >
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                className="ml-6 md:hidden text-foreground p-2"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Categories Navigation - Desktop */}
          <nav className="hidden md:block border-t border-gray-200">
            <ul className="flex justify-start overflow-x-auto py-3 space-x-8 font-poppins text-sm whitespace-nowrap">
              <li>
                <Link href="/products?filter=new" className="text-primary font-medium">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?category=women" className="text-foreground hover:text-primary">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/products?category=men" className="text-foreground hover:text-primary">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="text-foreground hover:text-primary">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-goods" className="text-foreground hover:text-primary">
                  Home Goods
                </Link>
              </li>
              <li>
                <Link href="/products?category=beauty" className="text-foreground hover:text-primary">
                  Beauty
                </Link>
              </li>
              <li>
                <Link href="/products?filter=sale" className="text-foreground hover:text-primary">
                  Sale
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white w-full border-t border-gray-200`}>
          <div className="container mx-auto px-6 py-4">
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:border-accent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit"
                  variant="ghost" 
                  className="absolute right-0 top-0 mt-2 mr-4 text-gray-400"
                >
                  <Search size={18} />
                </Button>
              </form>
            </div>
            <ul className="space-y-3 font-poppins mb-4">
              <li>
                <Link href="/products?filter=new" className="text-primary font-medium block">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?category=women" className="text-foreground hover:text-primary block">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/products?category=men" className="text-foreground hover:text-primary block">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="text-foreground hover:text-primary block">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-goods" className="text-foreground hover:text-primary block">
                  Home Goods
                </Link>
              </li>
              <li>
                <Link href="/products?category=beauty" className="text-foreground hover:text-primary block">
                  Beauty
                </Link>
              </li>
              <li>
                <Link href="/products?filter=sale" className="text-foreground hover:text-primary block">
                  Sale
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </header>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalType}
        onSuccess={(loggedIn) => {
          setIsAuthModalOpen(false);
          onLoginStatusChange(loggedIn);
        }}
      />
    </>
  );
}
