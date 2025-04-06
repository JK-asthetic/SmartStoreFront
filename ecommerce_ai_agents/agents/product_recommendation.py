# agents/product_recommendation.py
from .base_agent import BaseAgent
import json
import re
import sqlite3

class ProductRecommendationAgent(BaseAgent):
    """Agent for product recommendations"""
    def __init__(self, db_path=r"C:\Users\jatin\Desktop\Projects\Accenture hackathon\Database.sqlite"):
        super().__init__()
        self.system_prompt = """
        You are a product recommendation assistant for an e-commerce website.
        Your job is to understand what products the user might be interested in and provide helpful recommendations.
        Be conversational but concise. Ask follow-up questions if needed to narrow down their preferences.
        
        The website has the following main categories:
        - Books
        - Fashion
        - Fitness
        - Electronics
        - Home Decor
        - Beauty
        
        When a user expresses interest in filtering or browsing specific products, you should:
        1. Extract filtering criteria such as category, price range, and sorting preferences
        2. Prepare a filter command that the frontend can use
        3. Tell the user you're updating their view with relevant products
        """
        self.db_path = db_path
        
        # Hardcoded categories
        self.categories = [
            {"id": 1, "name": "Books", "slug": "books"},
            {"id": 2, "name": "Fashion", "slug": "fashion"},
            {"id": 3, "name": "Fitness", "slug": "fitness"},
            {"id": 4, "name": "Electronics", "slug": "electronics"},
            {"id": 5, "name": "Home Decor", "slug": "home-decor"},
            {"id": 6, "name": "Beauty", "slug": "beauty"}
        ]

    def search_products(self, query):
        """Simple search for products matching query terms using SQLite"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            search_term = f"%{query.lower()}%"
            cursor.execute("""
                SELECT * FROM products 
                WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?
                LIMIT 5
            """, (search_term, search_term))
            
            results = []
            for row in cursor.fetchall():
                product = dict(row)
                
                # Get category name
                category_name = "Uncategorized"
                if product.get('category_id'):
                    for category in self.categories:
                        if category['id'] == product['category_id']:
                            category_name = category['name']
                            break
                
                product['category'] = category_name
                results.append(product)
            
            conn.close()
            return results
            
        except sqlite3.Error:
            return []  # Return empty list if database error
    
    def extract_filter_criteria(self, message):
        """Extract filtering criteria from user message"""
        message = message.lower()
        filter_command = {"action": "filter"}
        
        # Extract categories
        category_matches = []
        for category in self.categories:
            if category['name'].lower() in message:
                category_matches.append(category['slug'])
        
        if category_matches:
            filter_command["categories"] = category_matches
        
        # Extract price range
        price_pattern = r"under\s+\$?(\d+)|less than\s+\$?(\d+)|below\s+\$?(\d+)|cheaper than\s+\$?(\d+)"
        max_price_match = re.search(price_pattern, message)
        if max_price_match:
            max_price = next(group for group in max_price_match.groups() if group is not None)
            filter_command["priceRange"] = [0, int(max_price)]
        
        price_range_pattern = r"between\s+\$?(\d+)\s+and\s+\$?(\d+)"
        price_range_match = re.search(price_range_pattern, message)
        if price_range_match:
            filter_command["priceRange"] = [int(price_range_match.group(1)), int(price_range_match.group(2))]
        
        # Extract sorting preference
        if "cheap" in message or "lowest price" in message or "price low" in message:
            filter_command["sort"] = "price-asc"
        elif "expensive" in message or "highest price" in message or "price high" in message:
            filter_command["sort"] = "price-desc"
        elif "newest" in message or "latest" in message or "recent" in message:
            filter_command["sort"] = "newest"
        elif "popular" in message or "best rated" in message or "top rated" in message:
            filter_command["sort"] = "rating"
        
        # Extract search query
        search_terms = []
        skip_words = ["show", "display", "find", "looking", "for", "me", "want", "need", "products", "items", "under", "over", "between", "and", "less", "than", "more", "cheap", "expensive", "newest", "popular", "best"]
        
        words = message.lower().split()
        for word in words:
            word = re.sub(r'[^\w\s]', '', word)  # Remove punctuation
            if word and word not in skip_words and len(word) > 2:
                search_terms.append(word)
        
        if search_terms:
            filter_command["search"] = " ".join(search_terms)
        
        # Extract view preference
        if "compact" in message or "list" in message:
            filter_command["view"] = "compact"
        elif "grid" in message or "tiles" in message:
            filter_command["view"] = "grid"
        
        return filter_command

    def process(self, user_id, message):
        # Extract filtering criteria
        filter_command = self.extract_filter_criteria(message)
        should_navigate = len(filter_command) > 1  # More than just "action": "filter"
        
        # Search for relevant products
        products = self.search_products(message)
                
        # Build context with product information
        product_context = ""
        if products:
            product_context = "Based on the query, these products might be relevant:\n"
            for i, product in enumerate(products, 1):
                product_context += f"{i}. {product['name']} - ${product['price']} - {product['category']}\n"
        
        # Generate response
        prompt = f"""
        User: {message}
        
        Available products: {product_context}
        
        Provide a helpful response about these products. If the user is searching or browsing with specific criteria, 
        mention that you're updating their view to show matching products.
        """
        ai_response = self.get_completion(prompt, self.system_prompt)
                
        return {
            "message": ai_response,
            "products": products,
            "agent_type": "product_recommendation",
            "filter_command": filter_command if should_navigate else None,
            "should_navigate": should_navigate
        }