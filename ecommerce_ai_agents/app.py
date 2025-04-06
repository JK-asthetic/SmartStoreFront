from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import sqlite3
from agents.intent_recognizer import IntentRecognizer
from agents.product_recommendation import ProductRecommendationAgent
from agents.order_tracking import OrderTrackingAgent
from agents.customer_support import CustomerSupportAgent

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Setup database if needed
def setup_database():
    db_path = r'C:\Users\jatin\Desktop\Projects\Accenture hackathon\Database.sqlite'
    
    # Create data directory if it doesn't exist
    if not os.path.exists('data'):
        os.makedirs('data')
    
    # Check if database exists, if not create it
    if not os.path.exists(db_path):
        print("Creating new SQLite database")
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Create tables if they don't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS purchases (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    total_amount REAL NOT NULL,
                    contextual_factor_id INTEGER
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS purchase_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    purchase_id INTEGER NOT NULL,
                    product_id TEXT NOT NULL,
                    quantity INTEGER NOT NULL,
                    price_at_purchase REAL NOT NULL,
                    FOREIGN KEY (purchase_id) REFERENCES purchases (id)
                )
            ''')
            
            # Add some dummy data if needed
            cursor.execute("SELECT COUNT(*) FROM purchases")
            count = cursor.fetchone()[0]
            
            if count == 0:
                print("Adding dummy order data")
                # Add sample purchase
                cursor.execute('''
                    INSERT INTO purchases (user_id, purchase_date, total_amount)
                    VALUES (1, '2025-03-30 10:15:00', 129.97)
                ''')
                purchase_id = cursor.lastrowid
                
                # Add sample items
                cursor.execute('''
                    INSERT INTO purchase_items (purchase_id, product_id, quantity, price_at_purchase)
                    VALUES (?, 'Premium Headphones', 1, 99.99)
                ''', (purchase_id,))
                
                cursor.execute('''
                    INSERT INTO purchase_items (purchase_id, product_id, quantity, price_at_purchase)
                    VALUES (?, 'USB-C Cable', 2, 14.99)
                ''', (purchase_id,))
                
                # Add another sample purchase
                cursor.execute('''
                    INSERT INTO purchases (user_id, purchase_date, total_amount)
                    VALUES (1, '2025-04-02 16:30:00', 49.95)
                ''')
                purchase_id = cursor.lastrowid
                
                cursor.execute('''
                    INSERT INTO purchase_items (purchase_id, product_id, quantity, price_at_purchase)
                    VALUES (?, 'Wireless Mouse', 1, 49.95)
                ''', (purchase_id,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error setting up database: {e}")

# Initialize agents
setup_database()
intent_recognizer = IntentRecognizer()
product_agent = ProductRecommendationAgent()
order_agent = OrderTrackingAgent()
support_agent = CustomerSupportAgent()

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """Main endpoint for chat interactions"""
    data = request.json
    user_id = data.get('userId', 'anonymous')
    print(user_id)
    
    # Convert string user_id to integer for database queries
    # Default to user 1 if anonymous or non-numeric
    if user_id == 'anonymous' or not user_id.isdigit():
        numeric_user_id = 1
    else:
        numeric_user_id = int(user_id)
        
    message = data.get('message', '')
    
    print(f"Received message: '{message}' from user: {user_id} (numeric ID: {numeric_user_id})")
    
    # Recognize intent
    intent = intent_recognizer.recognize(message)
    print(f"Recognized intent: {intent}")
    
    # Route to appropriate agent
    if intent == 'product_search':
        response = product_agent.process(numeric_user_id, message)
        # Pass through filter_command and should_navigate if they exist
        if 'filter_command' in response and 'should_navigate' in response:
            pass  # Keep these fields in the response
    elif intent == 'order_status':
        response = order_agent.process(numeric_user_id, message)
    elif intent == 'customer_support':
        response = support_agent.process(numeric_user_id, message)
    else:
        # Default to general response if intent unclear
        response = {
            "message": "I'm not sure what you're looking for. Would you like to browse products, check an order, or get customer support?",
            "suggestions": ["Show me popular products", "Where is my order?", "I need help with a return"]
        }
    
    print(f"Response: {response}")
    return jsonify(response)

@app.route('/api/products', methods=['GET'])
def get_products():
    """Endpoint to get product catalog"""
    try:
        # In a real app, you'd query the database for products
        # For simplicity, we'll keep using the JSON file if it exists
        if os.path.exists('data/products.json'):
            with open('data/products.json', 'r') as f:
                products = json.load(f)
            return jsonify(products)
        else:
            return jsonify([])
    except Exception as e:
        print(f"Error loading products: {e}")
        return jsonify([])

@app.route('/api/orders/<user_id>', methods=['GET'])
def get_orders(user_id):
    """Endpoint to get user orders"""
    try:
        # Convert user_id to integer
        if user_id == 'anonymous' or not user_id.isdigit():
            numeric_user_id = 1
        else:
            numeric_user_id = int(user_id)
            
        # Create a new instance to avoid potential threading issues
        order_tracker = OrderTrackingAgent()
        user_orders = order_tracker.get_user_orders(numeric_user_id)
        return jsonify(user_orders)
    except Exception as e:
        print(f"Error loading orders: {e}")
        return jsonify([])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)