import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  userPreferences, type UserPreference, type InsertUserPreference,
  cartItems, type CartItem, type InsertCartItem,
  wishlistItems, type WishlistItem, type InsertWishlistItem
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // User Preferences methods
  getUserPreferences(userId: number): Promise<UserPreference | undefined>;
  createUserPreferences(preferences: InsertUserPreference): Promise<UserPreference>;
  updateUserPreferences(userId: number, preferences: Partial<UserPreference>): Promise<UserPreference>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart methods
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, cartItemData: Partial<CartItem>): Promise<CartItem>;
  deleteCartItem(id: number): Promise<void>;
  
  // Wishlist methods
  getWishlistItems(userId: number): Promise<WishlistItem[]>;
  getWishlistItem(id: number): Promise<WishlistItem | undefined>;
  getWishlistItemByProductId(userId: number, productId: number): Promise<WishlistItem | undefined>;
  createWishlistItem(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  deleteWishlistItem(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userPreferences: Map<number, UserPreference>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private wishlistItems: Map<number, WishlistItem>;
  
  private userId: number;
  private categoryId: number;
  private productId: number;
  private userPreferenceId: number;
  private cartItemId: number;
  private wishlistItemId: number;
  
  constructor() {
    this.users = new Map();
    this.userPreferences = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.wishlistItems = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.productId = 1;
    this.userPreferenceId = 1;
    this.cartItemId = 1;
    this.wishlistItemId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...userData, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // User Preferences methods
  async getUserPreferences(userId: number): Promise<UserPreference | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (pref) => pref.userId === userId
    );
  }
  
  async createUserPreferences(preferencesData: InsertUserPreference): Promise<UserPreference> {
    const id = this.userPreferenceId++;
    const preferences: UserPreference = { ...preferencesData, id };
    this.userPreferences.set(id, preferences);
    return preferences;
  }
  
  async updateUserPreferences(userId: number, preferencesData: Partial<UserPreference>): Promise<UserPreference> {
    const preferences = await this.getUserPreferences(userId);
    if (!preferences) {
      throw new Error("User preferences not found");
    }
    
    const updatedPreferences = { ...preferences, ...preferencesData };
    this.userPreferences.set(preferences.id, updatedPreferences);
    return updatedPreferences;
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...categoryData, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug
    );
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const createdAt = new Date();
    const product: Product = { ...productData, id, createdAt };
    this.products.set(id, product);
    return product;
  }
  
  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }
  
  async getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
  }
  
  async createCartItem(cartItemData: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemId++;
    const cartItem: CartItem = { ...cartItemData, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async updateCartItem(id: number, cartItemData: Partial<CartItem>): Promise<CartItem> {
    const cartItem = await this.getCartItem(id);
    if (!cartItem) {
      throw new Error("Cart item not found");
    }
    
    const updatedCartItem = { ...cartItem, ...cartItemData };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async deleteCartItem(id: number): Promise<void> {
    this.cartItems.delete(id);
  }
  
  // Wishlist methods
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async getWishlistItem(id: number): Promise<WishlistItem | undefined> {
    return this.wishlistItems.get(id);
  }
  
  async getWishlistItemByProductId(userId: number, productId: number): Promise<WishlistItem | undefined> {
    return Array.from(this.wishlistItems.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
  }
  
  async createWishlistItem(wishlistItemData: InsertWishlistItem): Promise<WishlistItem> {
    const id = this.wishlistItemId++;
    const wishlistItem: WishlistItem = { ...wishlistItemData, id };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }
  
  async deleteWishlistItem(id: number): Promise<void> {
    this.wishlistItems.delete(id);
  }
  
  // Initialize with sample data
  private async initializeData() {
    // Create a demo user
    const demoUser = {
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      username: "demouser",
      password: "$2a$10$JWFPiDC5Xvd9hjjJrrc.WODOBoLIu/6JAYpxlaLhM3DiuhRv/mhLm", // hashed 'password123'
      location: "New York, USA"
    };
    await this.createUser(demoUser);
    
    // Create categories
    const categories = [
      {
        name: "Women",
        slug: "women",
        description: "Summer collection",
        imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80"
      },
      {
        name: "Men",
        slug: "men",
        description: "Urban styles",
        imageUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80"
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "Complete your look",
        imageUrl: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80"
      },
      {
        name: "Home",
        slug: "home-goods",
        description: "Stylish living",
        imageUrl: "https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80"
      }
    ];
    
    for (const categoryData of categories) {
      await this.createCategory(categoryData);
    }
    
    // Create products
    const products = [
      {
        name: "Casual Summer Dress",
        slug: "casual-summer-dress",
        description: "A lightweight, flowy dress perfect for summer days.",
        price: 49.99,
        rating: 4.8,
        reviewCount: 243,
        imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 1,
        isNew: true,
        isTrending: false
      },
      {
        name: "Men's Casual Jacket",
        slug: "mens-casual-jacket",
        description: "A stylish and comfortable jacket for everyday wear.",
        price: 79.99,
        rating: 4.7,
        reviewCount: 187,
        imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 2,
        isNew: true,
        isTrending: false
      },
      {
        name: "Classic Leather Watch",
        slug: "classic-leather-watch",
        description: "A timeless leather watch that elevates any outfit.",
        price: 129.99,
        rating: 4.9,
        reviewCount: 156,
        imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 3,
        isNew: true,
        isTrending: false
      },
      {
        name: "Modern Sunglasses",
        slug: "modern-sunglasses",
        description: "Stylish sunglasses with UV protection.",
        price: 59.99,
        rating: 4.6,
        reviewCount: 112,
        imageUrl: "https://images.unsplash.com/photo-1526887520775-4b14b8aed897?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 3,
        isNew: true,
        isTrending: false
      },
      {
        name: "Summer Straw Hat",
        slug: "summer-straw-hat",
        description: "A lightweight straw hat perfect for sunny days.",
        price: 39.99,
        rating: 4.8,
        reviewCount: 89,
        imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 1,
        isNew: true,
        isTrending: false
      },
      {
        name: "Athletic Running Sneakers",
        slug: "athletic-running-sneakers",
        description: "Comfortable running shoes with breathable material.",
        price: 89.99,
        oldPrice: 109.99,
        rating: 4.9,
        reviewCount: 278,
        imageUrl: "https://images.unsplash.com/photo-1556906535-0f09a537f0a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 2,
        isNew: false,
        isTrending: true
      },
      {
        name: "Designer Leather Handbag",
        slug: "designer-leather-handbag",
        description: "A premium leather handbag with multiple compartments.",
        price: 199.99,
        oldPrice: 249.99,
        rating: 4.8,
        reviewCount: 142,
        imageUrl: "https://images.unsplash.com/photo-1485218126466-34e6392ec754?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 3,
        isNew: false,
        isTrending: true
      },
      {
        name: "Premium Wireless Headphones",
        slug: "premium-wireless-headphones",
        description: "High-quality wireless headphones with noise cancellation.",
        price: 179.99,
        oldPrice: 229.99,
        rating: 4.7,
        reviewCount: 215,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 3,
        isNew: false,
        isTrending: true
      },
      {
        name: "Smart Fitness Watch",
        slug: "smart-fitness-watch",
        description: "Track your fitness goals with this smart watch.",
        price: 149.99,
        oldPrice: 199.99,
        rating: 4.6,
        reviewCount: 183,
        imageUrl: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 3,
        isNew: false,
        isTrending: true
      },
      {
        name: "Red Running Sneakers",
        slug: "red-running-sneakers",
        description: "Comfortable running shoes with a vibrant red design.",
        price: 79.99,
        rating: 4.8,
        reviewCount: 243,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 2,
        isNew: false,
        isTrending: false
      },
      {
        name: "Colorful Dress Socks Set",
        slug: "colorful-dress-socks-set",
        description: "A set of colorful dress socks for all occasions.",
        price: 24.99,
        rating: 4.6,
        reviewCount: 128,
        imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 2,
        isNew: false,
        isTrending: false
      },
      {
        name: "Wireless Bluetooth Earbuds",
        slug: "wireless-bluetooth-earbuds",
        description: "Compact wireless earbuds with great sound quality.",
        price: 89.99,
        rating: 4.7,
        reviewCount: 352,
        imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 3,
        isNew: false,
        isTrending: false
      },
      {
        name: "Modern Fashion Backpack",
        slug: "modern-fashion-backpack",
        description: "A stylish backpack with multiple compartments.",
        price: 59.99,
        rating: 4.5,
        reviewCount: 196,
        imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80",
        categoryId: 3,
        isNew: false,
        isTrending: false
      }
    ];
    
    for (const productData of products) {
      await this.createProduct(productData);
    }
  }
}

export const storage = new MemStorage();
