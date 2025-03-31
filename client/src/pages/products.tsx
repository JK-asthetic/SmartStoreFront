import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Product, Category } from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Filter, Grid, Grid3X3, SlidersHorizontal } from "lucide-react";

// Define the AI agent integration type
interface AIFilterCommand {
  action: 'filter';
  categories?: string[];
  priceRange?: [number, number];
  sort?: string;
  search?: string;
  view?: 'grid' | 'compact';
}

// Global function for AI agent integration
declare global {
  interface Window {
    applyAIFilters: (command: AIFilterCommand) => void;
  }
}

export default function Products() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [gridView, setGridView] = useState<"grid" | "compact">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  // Parse URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const filter = params.get("filter");
    const search = params.get("search");
    
    if (category) {
      setSelectedCategories([category]);
    }
    
    if (search) {
      setSearchQuery(search);
    }
    
    if (filter) {
      setSortBy(filter);
    }
  }, [location]);
  
  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch products with filters
  const { data: products, isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: [
      '/api/products',
      { 
        category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
        categories: selectedCategories.length > 1 ? selectedCategories : undefined,
        priceMin: priceRange[0],
        priceMax: priceRange[1],
        sortBy: sortBy,
        search: searchQuery,
        filter: undefined // We'll handle filtering on the client side
      }
    ],
  });
  
  const toggleCategory = (categorySlug: string) => {
    if (selectedCategories.includes(categorySlug)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categorySlug));
    } else {
      setSelectedCategories([...selectedCategories, categorySlug]);
    }
  };
  
  const applyFilters = () => {
    // Filters are already applied through the query parameters
    // This is just to toggle the mobile filter visibility
    setShowFilters(false);
  };
  
  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setSortBy("featured");
    setSearchQuery("");
    
    // Reset AI filter indicator
    if (aiFilterApplied) {
      setAiFilterApplied(false);
      setLastAiCommand(null);
      toast({
        title: "Filters Reset",
        description: "All filters have been reset to default values",
        duration: 3000,
      });
    }
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // State to track AI filter usage
  const [aiFilterApplied, setAiFilterApplied] = useState<boolean>(false);
  const [lastAiCommand, setLastAiCommand] = useState<AIFilterCommand | null>(null);
  
  // Implement global function for AI agent integration
  useEffect(() => {
    // Define the function
    const applyFiltersFromAI = (command: AIFilterCommand) => {
      if (command.action !== 'filter') return;
      
      if (command.categories) {
        setSelectedCategories(command.categories);
      }
      
      if (command.priceRange) {
        setPriceRange(command.priceRange);
      }
      
      if (command.sort) {
        setSortBy(command.sort);
      }
      
      if (command.search !== undefined) {
        setSearchQuery(command.search);
      }
      
      if (command.view && (command.view === 'grid' || command.view === 'compact')) {
        setGridView(command.view);
      }
      
      // Update AI filter state
      setAiFilterApplied(true);
      setLastAiCommand(command);
      
      console.log("AI filter applied:", command);
      
      // Show a toast notification
      toast({
        title: "AI Filtering Applied",
        description: "Your product view has been updated by AI assistant",
        duration: 3000,
      });
    };
    
    // Assign it to window object
    (window as any).applyAIFilters = applyFiltersFromAI;
    
    // Cleanup function
    return () => {
      (window as any).applyAIFilters = undefined;
    };
  }, [toast]);
  
  return (
    <div className="pt-32 md:pt-36 pb-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="font-poppins text-2xl md:text-3xl font-semibold text-primary mb-4 md:mb-0">
            {searchQuery ? `Search: ${searchQuery}` : "All Products"}
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Button 
                variant={gridView === "grid" ? "default" : "outline"} 
                size="icon"
                onClick={() => setGridView("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={gridView === "compact" ? "default" : "outline"} 
                size="icon"
                onClick={() => setGridView("compact")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative w-40">
              <select
                className="w-full border border-gray-300 rounded-md p-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-accent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            
            <Button
              variant="outline"
              className="md:hidden"
              onClick={toggleFilters}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Filters - Desktop */}
          <div className="hidden md:block w-64 pr-6">
            <div className="sticky top-36">
              <div className="mb-6">
                <h3 className="font-poppins font-medium text-lg mb-3">Categories</h3>
                {isCategoriesLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-6" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories?.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.slug)}
                          onCheckedChange={() => toggleCategory(category.slug)}
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="ml-2 cursor-pointer"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-6">
                <h3 className="font-poppins font-medium text-lg mb-3">Price Range</h3>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="my-6"
                  />
                  <div className="flex justify-between">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <Button 
                  variant="default" 
                  className="w-full mb-2"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
                
                {aiFilterApplied && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <div className="flex items-center text-blue-700 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="font-medium">AI Assistant</span>
                    </div>
                    <p className="text-blue-600">
                      Filters applied by AI assistant
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Filters - Mobile */}
          {showFilters && (
            <div className="md:hidden fixed inset-0 bg-background z-40 overflow-auto pt-20">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-poppins font-semibold text-xl">Filters</h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={toggleFilters}
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-poppins font-medium text-lg mb-3">Categories</h3>
                  {isCategoriesLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="w-full h-6" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categories?.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <Checkbox
                            id={`mobile-category-${category.id}`}
                            checked={selectedCategories.includes(category.slug)}
                            onCheckedChange={() => toggleCategory(category.slug)}
                          />
                          <Label
                            htmlFor={`mobile-category-${category.id}`}
                            className="ml-2 cursor-pointer"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="mb-6">
                  <h3 className="font-poppins font-medium text-lg mb-3">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      min={0}
                      max={1000}
                      step={10}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="my-6"
                    />
                    <div className="flex justify-between">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex flex-col space-y-2 mt-6">
                  <Button 
                    variant="default" 
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                  
                  {aiFilterApplied && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                      <div className="flex items-center text-blue-700 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-medium">AI Assistant</span>
                      </div>
                      <p className="text-blue-600">
                        Filters applied by AI assistant
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Product Grid */}
          <div className="flex-1">
            {isProductsLoading ? (
              <div className={`grid ${
                gridView === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 md:grid-cols-2"
              } gap-6`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="w-full h-72 rounded-lg" />
                    <Skeleton className="w-3/4 h-5 mt-4" />
                    <Skeleton className="w-1/2 h-4 mt-2" />
                    <div className="flex justify-between mt-2">
                      <Skeleton className="w-1/4 h-5" />
                      <Skeleton className="w-1/5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className={`grid ${
                gridView === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 md:grid-cols-2"
              } gap-6`}>
                {products
                  // Apply additional client-side filtering for price range
                  .filter(product => product.price >= priceRange[0] && product.price <= priceRange[1])
                  // Filter by selected categories
                  .filter(product => {
                    if (selectedCategories.length === 0) return true;
                    
                    // Get the category slug for this product's categoryId
                    const productCategory = categories?.find(c => c.id === product.categoryId);
                    return productCategory && selectedCategories.includes(productCategory.slug);
                  })
                  // Apply sorting
                  .sort((a, b) => {
                    if (sortBy === 'price-asc') return a.price - b.price;
                    if (sortBy === 'price-desc') return b.price - a.price;
                    if (sortBy === 'newest') {
                      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                    }
                    if (sortBy === 'rating') {
                      const ratingA = a.rating || 0;
                      const ratingB = b.rating || 0;
                      return ratingB - ratingA;
                    }
                    return 0; // Default for 'featured'
                  })
                  .map((product) => {
                    // Attach category name to product for display
                    const enrichedProduct = {
                      ...product,
                      categoryName: categories?.find(c => c.id === product.categoryId)?.name
                    };
                    
                    return (
                      <ProductCard 
                        key={product.id} 
                        product={enrichedProduct} 
                        variant={gridView === "compact" ? "compact" : "default"}
                      />
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-poppins font-medium text-lg text-gray-700 mb-2">No Products Found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We couldn't find any products that match your current filters. Try adjusting your selection or browse our other categories.
                </p>
                <Button 
                  variant="default" 
                  className="mt-6"
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
