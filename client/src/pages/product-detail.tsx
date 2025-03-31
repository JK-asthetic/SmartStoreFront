import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import { Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Heart, Minus, Plus, Share2, ShoppingBag, Star, Truck } from "lucide-react";
import NewArrivalsSection from "@/components/sections/new-arrivals-section";
import RecommendedSection from "@/components/sections/recommended-section";

export default function ProductDetail() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const slug = location.split("/").pop();
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
  });
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      await apiRequest("POST", "/api/cart", { 
        productId: product.id,
        quantity: quantity
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} (${quantity}) has been added to your cart.`,
      });
      
      // Invalidate cart count
      queryClient.invalidateQueries({ queryKey: ['/api/cart/count'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleAddToWishlist = async () => {
    if (!product) return;
    
    setIsAddingToWishlist(true);
    try {
      await apiRequest("POST", "/api/wishlist", { productId: product.id });
      
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
      
      // Invalidate wishlist count
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist/count'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to wishlist",
        variant: "destructive",
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };
  
  if (error) {
    return (
      <div className="pt-32 md:pt-36 pb-24 container mx-auto px-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-32 md:pt-36 pb-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-accent">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-accent">Products</Link>
          {product && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-700">{product.name}</span>
            </>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <Skeleton className="w-full h-96 rounded-lg" />
              <div className="flex mt-4 space-x-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="w-3/4 h-10 mb-4" />
              <Skeleton className="w-1/3 h-8 mb-6" />
              <Skeleton className="w-full h-32 mb-6" />
              <Skeleton className="w-1/4 h-6 mb-2" />
              <Skeleton className="w-1/2 h-6 mb-6" />
              <div className="flex space-x-4 mb-6">
                <Skeleton className="w-32 h-12" />
                <Skeleton className="w-full h-12" />
              </div>
              <Skeleton className="w-full h-12" />
            </div>
          </div>
        ) : product && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Product Images */}
            <div>
              <div className="relative rounded-lg overflow-hidden bg-white">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-auto object-cover"
                />
                
                {product.isNew && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-secondary text-white text-xs font-semibold px-2 py-1 rounded">NEW</span>
                  </div>
                )}
                
                {product.isTrending && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-accent text-white text-xs font-semibold px-2 py-1 rounded">TRENDING</span>
                  </div>
                )}
              </div>
              
              {/* Image thumbnails if we had multiple images */}
              <div className="flex mt-4 space-x-2">
                {[...Array(4)].map((_, i) => (
                  <button
                    key={i}
                    className={`w-20 h-20 rounded border-2 ${
                      selectedImage === i ? "border-accent" : "border-transparent"
                    } overflow-hidden focus:outline-none`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img 
                      src={product.imageUrl} 
                      alt={`${product.name} thumbnail ${i+1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Product Details */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center mb-4">
                {product.rating && (
                  <div className="flex items-center mr-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${
                          i < Math.round(product.rating) 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300"
                        }`} 
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {product.rating} {product.reviewCount && `(${product.reviewCount} reviews)`}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center mb-6">
                <span className="text-2xl font-bold text-primary mr-3">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                {product.oldPrice && (
                  <span className="ml-3 bg-red-100 text-red-600 px-2 py-0.5 rounded text-sm font-medium">
                    {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-6">
                {product.description || "No description available for this product."}
              </p>
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-r-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="h-10 w-16 flex items-center justify-center border-y border-input">
                    {quantity}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    className="h-10 w-10 rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 mb-8">
                <Button
                  variant="outline"
                  className="flex-none"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Wishlist
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white flex-grow"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
              
              {/* Shipping Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-8">
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Free Shipping</p>
                    <p className="text-sm text-gray-500">On all orders over $50</p>
                  </div>
                </div>
              </div>
              
              {/* Share */}
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-3">Share:</span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <i className="fab fa-facebook-f text-gray-500"></i>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <i className="fab fa-twitter text-gray-500"></i>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <i className="fab fa-pinterest text-gray-500"></i>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Product Details Tabs */}
        {product && (
          <div className="mt-16">
            <Tabs defaultValue="description">
              <TabsList className="w-full max-w-md mx-auto mb-8">
                <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                <TabsTrigger value="specifications" className="flex-1">Specifications</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="bg-white p-6 rounded-lg">
                <div className="prose max-w-none">
                  <p>{product.description || "No detailed description available for this product."}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="bg-white p-6 rounded-lg">
                <div className="divide-y">
                  <div className="grid grid-cols-3 py-3">
                    <span className="font-medium text-gray-700">Brand</span>
                    <span className="col-span-2">Brand Name</span>
                  </div>
                  <div className="grid grid-cols-3 py-3">
                    <span className="font-medium text-gray-700">Material</span>
                    <span className="col-span-2">Material Type</span>
                  </div>
                  <div className="grid grid-cols-3 py-3">
                    <span className="font-medium text-gray-700">Dimensions</span>
                    <span className="col-span-2">Product Dimensions</span>
                  </div>
                  <div className="grid grid-cols-3 py-3">
                    <span className="font-medium text-gray-700">Weight</span>
                    <span className="col-span-2">Product Weight</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="bg-white p-6 rounded-lg">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                    <Button>Write a Review</Button>
                  </div>
                  
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to review this product.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {/* Related Products */}
        <div className="mt-16">
          <NewArrivalsSection />
        </div>
        
        {/* You May Also Like */}
        <div className="mt-16">
          <RecommendedSection />
        </div>
      </div>
    </div>
  );
}
