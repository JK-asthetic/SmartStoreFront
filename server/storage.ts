import Database from 'better-sqlite3';
import path from 'path';
import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  userPreferences, type UserPreference, type InsertUserPreference,
  cartItems, type CartItem, type InsertCartItem,
  wishlistItems, type WishlistItem, type InsertWishlistItem
} from "@shared/schema";
interface PurchaseItem {
  id: number;
  purchase_id: number;
  product_name: string; // Changed from product_id since it stores the name
  quantity: number;
  price_at_purchase: number;
}

interface Purchase {
  id: number;
  user_id: number;
  purchase_date: string;
  total_amount: number;
  items: PurchaseItem[];
}

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

export class SQLiteStorage implements IStorage {
  private db: Database;

  constructor(dbPath?: string) {
    try {
      // Use provided path or default to 'store.db' in the same directory
      const databasePath = dbPath || path.join(__dirname, 'store.db');
      this.db = new Database(databasePath, { 
        readonly: false, // Set to true if you want read-only access
        fileMustExist: true, // This ensures we only connect to existing database files
        timeout: 5000 // Timeout in ms when acquiring a connection
      });
      
      this.db.pragma('foreign_keys = ON');
      this.db.pragma('journal_mode = WAL'); // Better concurrent access
      
      // Verify connection by running a simple query
      this.db.prepare('SELECT 1').get();
      
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw new Error('Database connection failed');
    }
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const row = this.db.prepare(`
        SELECT 
          id,
          username,
          email,
          password,
          first_name as firstName,
          last_name as lastName,
          location,
          age,
          gender,
          customer_segment as customerSegment,
          created_at as createdAt
        FROM users
        WHERE id = ?
      `).get(id);

      if (!row) return undefined;

      return {
        ...row
        // createdAt: this.parseDate(row.createdAt)
      } as User;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const row = this.db.prepare(`
        SELECT 
          id,
          username,
          email,
          password,
          first_name as firstName,
          last_name as lastName,
          location,
          age,
          gender,
          customer_segment as customerSegment,
          created_at as createdAt
        FROM users
        WHERE email = ?
      `).get(email);

      console.log(row);
      if (!row) return undefined;

      return {
        ...row
        // createdAt: this.parseDate(row.createdAt)
      } as User;
    } catch (error) {
      console.error(`Error fetching user by email ${email}:`, error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const row = this.db.prepare(`
      SELECT id, username, email, password, first_name as firstName, 
             last_name as lastName, location, created_at as createdAt
      FROM users WHERE username = ?
    `).get(username);
    return row ? row as User : undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const result = this.db.prepare(`
        INSERT INTO users (
          username,
          email,
          password,
          first_name,
          last_name,
          location,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userData.username,
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        userData.location,
        this.formatDate(this.currentTimestamp)
      );

      return this.getUser(result.lastInsertRowid as number) as Promise<User>;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const sets: string[] = [];
    const values: any[] = [];

    if (userData.firstName !== undefined) {
      sets.push('first_name = ?');
      values.push(userData.firstName);
    }
    if (userData.lastName !== undefined) {
      sets.push('last_name = ?');
      values.push(userData.lastName);
    }
    if (userData.email !== undefined) {
      sets.push('email = ?');
      values.push(userData.email);
    }
    if (userData.password !== undefined) {
      sets.push('password = ?');
      values.push(userData.password);
    }
    if (userData.location !== undefined) {
      sets.push('location = ?');
      values.push(userData.location);
    }

    values.push(id);

    this.db.prepare(`
      UPDATE users SET ${sets.join(', ')} WHERE id = ?
    `).run(...values);

    return this.getUser(id) as Promise<User>;
  }
  async getUserOrders(userId: number): Promise<Purchase[]> {
    try {
      const purchases = this.db.prepare(`
        SELECT 
          p.id,
          p.user_id,
          p.purchase_date,
          p.total_amount,
          pi.id as item_id,
          pi.product_id as product_name, -- Using product_id directly as name
          pi.quantity,
          pi.price_at_purchase
        FROM purchases p
        LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
        WHERE p.user_id = ?
        ORDER BY p.purchase_date DESC
      `).all(userId);
  
      // Group items by purchase
      const ordersMap = new Map<number, Purchase>();
      
      purchases.forEach((row: any) => {
        if (!ordersMap.has(row.id)) {
          ordersMap.set(row.id, {
            id: row.id,
            user_id: row.user_id,
            purchase_date: row.purchase_date,
            total_amount: row.total_amount,
            items: []
          });
        }
  
        if (row.item_id) {
          ordersMap.get(row.id)!.items.push({
            id: row.item_id,
            purchase_id: row.id,
            product_name: row.product_name, // Using the product name directly from product_id
            quantity: row.quantity,
            price_at_purchase: row.price_at_purchase
          });
        }
      });
  
      return Array.from(ordersMap.values());
    } catch (error) {
      console.error(`Error fetching orders for user ${userId}:`, error);
      throw error;
    }
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return this.db.prepare(`
      SELECT id, name, slug, description, image_url as imageUrl
      FROM categories
    `).all() as Category[];
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const row = this.db.prepare(`
      SELECT id, name, slug, description, image_url as imageUrl
      FROM categories WHERE id = ?
    `).get(id);
    return row ? row as Category : undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const row = this.db.prepare(`
      SELECT id, name, slug, description, image_url as imageUrl
      FROM categories WHERE slug = ?
    `).get(slug);
    return row ? row as Category : undefined;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const result = this.db.prepare(`
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `).run(
      categoryData.name,
      categoryData.slug,
      categoryData.description,
      categoryData.imageUrl
    );

    return this.getCategory(result.lastInsertRowid as number) as Promise<Category>;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT 
          p.id, 
          p.name, 
          p.slug, 
          p.description, 
          p.price, 
          p.old_price as oldPrice,
          p.brand,
          p.rating, 
          p.review_count as reviewCount, 
          p.image_url as imageUrl,
          p.category_id as categoryId,
          p.subcategory,
          p.is_new as isNew, 
          p.is_trending as isTrending,
          p.created_at as createdAt,
          c.name as categoryName
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
      `);

      const rows = stmt.all();
      return rows.map(row => ({
        ...row,
        isNew: Boolean(row.isNew),
        isTrending: Boolean(row.isTrending),
        createdAt: row.createdAt ? new Date(row.createdAt) : undefined
      })) as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const row = this.db.prepare(`
      SELECT id, name, slug, description, price, old_price as oldPrice,
             rating, review_count as reviewCount, image_url as imageUrl,
             category_id as categoryId, is_new as isNew, is_trending as isTrending,
             created_at as createdAt
      FROM products WHERE id = ?
    `).get(id);
    return row ? row as Product : undefined;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const row = this.db.prepare(`
      SELECT id, name, slug, description, price, old_price as oldPrice,
             rating, review_count as reviewCount, image_url as imageUrl,
             category_id as categoryId, is_new as isNew, is_trending as isTrending,
             created_at as createdAt
      FROM products WHERE slug = ?
    `).get(slug);
    return row ? row as Product : undefined;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const result = this.db.prepare(`
      INSERT INTO products (
        name, slug, description, price, old_price, rating,
        review_count, image_url, category_id, is_new, is_trending
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      productData.name,
      productData.slug,
      productData.description,
      productData.price,
      productData.oldPrice,
      productData.rating,
      productData.reviewCount,
      productData.imageUrl,
      productData.categoryId,
      productData.isNew ? 1 : 0,
      productData.isTrending ? 1 : 0
    );

    return this.getProduct(result.lastInsertRowid as number) as Promise<Product>;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return this.db.prepare(`
      SELECT id, user_id as userId, product_id as productId,
             quantity, added_at as addedAt
      FROM cart_items WHERE user_id = ?
    `).all(userId) as CartItem[];
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    const row = this.db.prepare(`
      SELECT id, user_id as userId, product_id as productId,
             quantity, added_at as addedAt
      FROM cart_items WHERE id = ?
    `).get(id);
    return row ? row as CartItem : undefined;
  }

  async getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined> {
    const row = this.db.prepare(`
      SELECT id, user_id as userId, product_id as productId,
             quantity, added_at as addedAt
      FROM cart_items WHERE user_id = ? AND product_id = ?
    `).get(userId, productId);
    return row ? row as CartItem : undefined;
  }

  async createCartItem(cartItemData: InsertCartItem): Promise<CartItem> {
    const result = this.db.prepare(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (?, ?, ?)
    `).run(
      cartItemData.userId,
      cartItemData.productId,
      cartItemData.quantity || 1
    );

    return this.getCartItem(result.lastInsertRowid as number) as Promise<CartItem>;
  }

  async updateCartItem(id: number, cartItemData: Partial<CartItem>): Promise<CartItem> {
    if (cartItemData.quantity !== undefined) {
      this.db.prepare(`
        UPDATE cart_items SET quantity = ? WHERE id = ?
      `).run(cartItemData.quantity, id);
    }

    return this.getCartItem(id) as Promise<CartItem>;
  }

  async deleteCartItem(id: number): Promise<void> {
    this.db.prepare('DELETE FROM cart_items WHERE id = ?').run(id);
  }

  // Wishlist methods
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return this.db.prepare(`
      SELECT id, user_id as userId, product_id as productId,
             added_at as addedAt
      FROM wishlist_items WHERE user_id = ?
    `).all(userId) as WishlistItem[];
  }

  async getWishlistItem(id: number): Promise<WishlistItem | undefined> {
    const row = this.db.prepare(`
      SELECT id, user_id as userId, product_id as productId,
             added_at as addedAt
      FROM wishlist_items WHERE id = ?
    `).get(id);
    return row ? row as WishlistItem : undefined;
  }

  async getWishlistItemByProductId(userId: number, productId: number): Promise<WishlistItem | undefined> {
    const row = this.db.prepare(`
      SELECT id, user_id as userId, product_id as productId,
             added_at as addedAt
      FROM wishlist_items WHERE user_id = ? AND product_id = ?
    `).get(userId, productId);
    return row ? row as WishlistItem : undefined;
  }

  async createWishlistItem(wishlistItemData: InsertWishlistItem): Promise<WishlistItem> {
    const result = this.db.prepare(`
      INSERT INTO wishlist_items (user_id, product_id)
      VALUES (?, ?)
    `).run(
      wishlistItemData.userId,
      wishlistItemData.productId
    );

    return this.getWishlistItem(result.lastInsertRowid as number) as Promise<WishlistItem>;
  }

  async deleteWishlistItem(id: number): Promise<void> {
    this.db.prepare('DELETE FROM wishlist_items WHERE id = ?').run(id);
  }

  // User Preferences methods
  async getUserPreferences(userId: number): Promise<UserPreference | undefined> {
    const row = this.db.prepare(`
      SELECT id, user_id as userId, preferred_categories as preferredCategories
      FROM user_preferences WHERE user_id = ?
    `).get(userId);
    
    if (row) {
      return {
        ...row,
        preferredCategories: JSON.parse(row.preferredCategories || '[]')
      } as UserPreference;
    }
    return undefined;
  }

  async createUserPreferences(preferencesData: InsertUserPreference): Promise<UserPreference> {
    const result = this.db.prepare(`
      INSERT INTO user_preferences (user_id, preferred_categories)
      VALUES (?, ?)
    `).run(
      preferencesData.userId,
      JSON.stringify(preferencesData.preferredCategories)
    );

    return this.getUserPreferences(preferencesData.userId) as Promise<UserPreference>;
  }

  async updateUserPreferences(userId: number, preferencesData: Partial<UserPreference>): Promise<UserPreference> {
    if (preferencesData.preferredCategories !== undefined) {
      this.db.prepare(`
        UPDATE user_preferences 
        SET preferred_categories = ?
        WHERE user_id = ?
      `).run(JSON.stringify(preferencesData.preferredCategories), userId);
    }

    return this.getUserPreferences(userId) as Promise<UserPreference>;
  }
}
const DB_CONFIG = {
  path: 'C:\\Users\\jatin\\Desktop\\Projects\\Accenture hackathon\\Database.sqlite',
  options: {
    readonly: false,
    fileMustExist: true,
    timeout: 5000,
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
  }
};

const dbPath = 'C:\\Users\\jatin\\Desktop\\Projects\\Accenture hackathon\\Database.sqlite';
export const storage = new SQLiteStorage(dbPath);

