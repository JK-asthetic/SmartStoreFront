import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  location: true,
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  oldPrice: doublePrecision("old_price"),
  rating: doublePrecision("rating"),
  reviewCount: integer("review_count"),
  imageUrl: text("image_url"),
  categoryId: integer("category_id"),
  isNew: boolean("is_new").default(false),
  isTrending: boolean("is_trending").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  slug: true,
  description: true,
  price: true,
  oldPrice: true,
  rating: true,
  reviewCount: true,
  imageUrl: true,
  categoryId: true,
  isNew: true,
  isTrending: true,
});

// User Preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  preferredCategories: text("preferred_categories").array(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  preferredCategories: true,
});

// Cart Items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
});

// Wishlists
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).pick({
  userId: true,
  productId: true,
});

// Define Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferencesSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
