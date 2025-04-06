import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertCategorySchema, insertCartItemSchema, insertWishlistItemSchema, insertUserPreferencesSchema } from "../shared/schema";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.get("/api/user/orders", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const orders = await storage.getUserOrders(req.session.userId);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      console.log("hello");
      
      // // Check password
      // const passwordMatch = await bcrypt.compare(password, user.password);
      // if (!passwordMatch) {
      //   return res.status(401).json({ message: "Invalid email or password" });
      // }
      console.log("hello");
      // Create session
      req.session.userId = user.id;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // User Routes
  app.get("/api/user/profile", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });
  
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userData = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        location: z.string().optional(),
      }).parse(req.body);
      
      const updatedUser = await storage.updateUser(req.session.userId, userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  app.patch("/api/user/password", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { currentPassword, newPassword } = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      }).parse(req.body);
      
      // Get user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await storage.updateUser(req.session.userId, { password: hashedPassword });
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  
  app.get("/api/user/preferences", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const preferences = await storage.getUserPreferences(req.session.userId);
      
      if (!preferences) {
        return res.status(200).json({ userId: req.session.userId, preferredCategories: [] });
      }
      
      res.status(200).json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user preferences" });
    }
  });
  
  app.post("/api/user/preferences", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const preferencesData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const existingPreferences = await storage.getUserPreferences(req.session.userId);
      
      let preferences;
      if (existingPreferences) {
        preferences = await storage.updateUserPreferences(req.session.userId, preferencesData);
      } else {
        preferences = await storage.createUserPreferences(preferencesData);
      }
      
      res.status(200).json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });
  
  // Categories Routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get categories" });
    }
  });
  
  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to get category" });
    }
  });
  
  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      
      // Check if category with this slug already exists
      const existingCategory = await storage.getCategoryBySlug(categoryData.slug);
      if (existingCategory) {
        return res.status(409).json({ message: "Category with this slug already exists" });
      }
      
      const category = await storage.createCategory(categoryData);
      
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  // Products Routes
  app.get("/api/products", async (req, res) => {
    try {
      // Parse query parameters
      const categorySlug = req.query.category as string;
      const filter = req.query.filter as string;
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as string;
      const limit = parseInt(req.query.limit as string) || 1000;
      const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined;
      const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined;
      
      let products = await storage.getAllProducts();
      
      // Apply category filter
      if (categorySlug) {
        const category = await storage.getCategoryBySlug(categorySlug);
        if (category) {
          products = products.filter(product => product.categoryId === category.id);
        }
      }
      
      // Apply product filter
      if (filter) {
        if (filter === 'new') {
          products = products.filter(product => product.isNew);
        } else if (filter === 'trending') {
          products = products.filter(product => product.isTrending);
        } else if (filter === 'sale') {
          products = products.filter(product => product.oldPrice !== null && product.oldPrice > product.price);
        } else if (filter === 'recommended') {
          // In a real app, this would use user preferences for recommendations
          // Here we'll just return some products as a sample
          products = products.slice(0, 8);
        }
      }
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchLower) || 
          (product.description && product.description.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply price range filter
      if (priceMin !== undefined) {
        products = products.filter(product => product.price >= priceMin);
      }
      
      if (priceMax !== undefined) {
        products = products.filter(product => product.price <= priceMax);
      }
      
      // Apply sorting
      if (sortBy) {
        if (sortBy === 'price-asc') {
          products = products.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
          products = products.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'newest') {
          products = products.sort((a, b) => {
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          });
        } else if (sortBy === 'rating') {
          products = products.sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            return ratingB - ratingA;
          });
        }
      }
      
      // Apply limit
      products = products.slice(0, limit);
      
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products" });
    }
  });
  
  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product" });
    }
  });
  
  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Check if product with this slug already exists
      const existingProduct = await storage.getProductBySlug(productData.slug);
      if (existingProduct) {
        return res.status(409).json({ message: "Product with this slug already exists" });
      }
      
      const product = await storage.createProduct(productData);
      
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  // Cart Routes
  app.get("/api/cart", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cartItems = await storage.getCartItems(req.session.userId);
      
      // Get products for each cart item
      const cartItemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return { ...item, product };
        })
      );
      
      res.status(200).json(cartItemsWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cart items" });
    }
  });
  
  app.post("/api/cart", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Check if product exists
      const product = await storage.getProduct(cartItemData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if item already in cart
      const existingCartItem = await storage.getCartItemByProductId(req.session.userId, cartItemData.productId);
      
      let cartItem;
      if (existingCartItem) {
        // Update quantity
        cartItem = await storage.updateCartItem(existingCartItem.id, {
          quantity: existingCartItem.quantity + (cartItemData.quantity || 1)
        });
      } else {
        // Create new cart item
        cartItem = await storage.createCartItem(cartItemData);
      }
      
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  
  app.patch("/api/cart/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cartItemId = parseInt(req.params.id);
      
      // Check if cart item exists and belongs to user
      const cartItem = await storage.getCartItem(cartItemId);
      if (!cartItem || cartItem.userId !== req.session.userId) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const { quantity } = z.object({
        quantity: z.number().min(1)
      }).parse(req.body);
      
      const updatedCartItem = await storage.updateCartItem(cartItemId, { quantity });
      
      res.status(200).json(updatedCartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  
  app.delete("/api/cart/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cartItemId = parseInt(req.params.id);
      
      // Check if cart item exists and belongs to user
      const cartItem = await storage.getCartItem(cartItemId);
      if (!cartItem || cartItem.userId !== req.session.userId) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      await storage.deleteCartItem(cartItemId);
      
      res.status(200).json({ message: "Cart item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete cart item" });
    }
  });
  
  app.get("/api/cart/count", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cartItems = await storage.getCartItems(req.session.userId);
      
      // Calculate total quantity
      const count = cartItems.reduce((total, item) => total + item.quantity, 0);
      
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get cart count" });
    }
  });
  
  // Wishlist Routes
  app.get("/api/wishlist", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const wishlistItems = await storage.getWishlistItems(req.session.userId);
      
      // Get products for each wishlist item
      const wishlistItemsWithProducts = await Promise.all(
        wishlistItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return { ...item, product };
        })
      );
      
      res.status(200).json(wishlistItemsWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get wishlist items" });
    }
  });
  
  app.post("/api/wishlist", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const wishlistItemData = insertWishlistItemSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Check if product exists
      const product = await storage.getProduct(wishlistItemData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if item already in wishlist
      const existingWishlistItem = await storage.getWishlistItemByProductId(req.session.userId, wishlistItemData.productId);
      
      if (existingWishlistItem) {
        return res.status(409).json({
          message: "Product already in wishlist",
          wishlistItem: existingWishlistItem
        });
      }
      
      // Create new wishlist item
      const wishlistItem = await storage.createWishlistItem(wishlistItemData);
      
      res.status(201).json(wishlistItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to wishlist" });
    }
  });
  
  app.delete("/api/wishlist/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const wishlistItemId = parseInt(req.params.id);
      
      // Check if wishlist item exists and belongs to user
      const wishlistItem = await storage.getWishlistItem(wishlistItemId);
      if (!wishlistItem || wishlistItem.userId !== req.session.userId) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      
      await storage.deleteWishlistItem(wishlistItemId);
      
      res.status(200).json({ message: "Wishlist item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete wishlist item" });
    }
  });
  
  app.get("/api/wishlist/count", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const wishlistItems = await storage.getWishlistItems(req.session.userId);
      
      res.status(200).json({ count: wishlistItems.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to get wishlist count" });
    }
  });
  
  // Newsletter subscription
  app.post("/api/newsletter", async (req, res) => {
    try {
      const { email } = z.object({
        email: z.string().email()
      }).parse(req.body);
      
      // In a real app, this would add the email to a subscription database
      // Here we'll just return success
      
      res.status(200).json({ 
        message: "Subscription successful",
        email 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email address", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
