# utils/dummy_data_generator.py
import json
import random
from datetime import datetime, timedelta

def generate_dummy_data():
    """Generate dummy data for testing"""
    # Generate products
    products = generate_products()
    with open('data/products.json', 'w') as f:
        json.dump(products, f, indent=2)
    
    # Generate orders
    orders = generate_orders(products)
    with open('data/orders.json', 'w') as f:
        json.dump(orders, f, indent=2)
    
    # Generate support FAQs
    faqs = generate_support_faq()
    with open('data/support_faq.json', 'w') as f:
        json.dump(faqs, f, indent=2)
    
    print("Dummy data generated successfully")

def generate_products(num_products=50):
    """Generate dummy product data"""
    categories = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Beauty", "Sports", "Toys"]
    products = []
    
    for i in range(1, num_products + 1):
        category = random.choice(categories)
        
        if category == "Electronics":
            names = ["Smartphone", "Laptop", "Headphones", "Tablet", "Smart Watch", "Wireless Earbuds"]
            name = f"{random.choice(['Premium', 'Ultra', 'Pro', 'Max', 'Elite'])} {random.choice(names)}"
            price = round(random.uniform(99.99, 1299.99), 2)
        elif category == "Clothing":
            names = ["T-Shirt", "Jeans", "Dress", "Jacket", "Sweater", "Hoodie"]
            name = f"{random.choice(['Casual', 'Formal', 'Vintage', 'Modern', 'Classic'])} {random.choice(names)}"
            price = round(random.uniform(19.99, 149.99), 2)
        else:
            names = ["Essential", "Deluxe", "Premium", "Basic", "Professional", "Starter"]
            name = f"{random.choice(names)} {category} Item {i}"
            price = round(random.uniform(9.99, 199.99), 2)
        
        product = {
            "id": i,
            "name": name,
            "category": category,
            "price": price,
            "description": f"This is a high-quality {name.lower()} perfect for everyday use. Featuring modern design and reliable performance.",
            "rating": round(random.uniform(3.5, 5.0), 1),
            "stock": random.randint(0, 100),
            "image_url": f"/product-image-{i}.jpg"  # Placeholder image URLs
        }
        products.append(product)
    
    return products

def generate_orders(products, num_orders=20):
    """Generate dummy order data"""
    orders = []
    statuses = ["Processing", "Shipped", "Delivered", "Cancelled"]
    user_ids = [f"user{i}" for i in range(1, 6)]  # 5 dummy users
    
    for i in range(1, num_orders + 1):
        user_id = random.choice(user_ids)
        num_items = random.randint(1, 5)
        order_items = random.sample(products, num_items)
        
        # Calculate dates (within the last 30 days)
        days_ago = random.randint(0, 30)
        order_date = (timedelta(days=days_ago)).strftime("%Y-%m-%d")
        
        # Determine status based on date
        if days_ago < 2:
            status = "Processing"
        elif days_ago < 5:
            status = "Shipped"
        elif days_ago < 20:
            status = "Delivered"
        else:
            status = random.choice(statuses)  # Random for older orders
        
        items = []
        total = 0
        for product in order_items:
            quantity = random.randint(1, 3)
            item_total = quantity * product["price"]
            total += item_total
            
            items.append({
                "id": product["id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": quantity,
                "total": round(item_total, 2)
            })
        
        order = {
            "order_id": f"ORD-{10000 + i}",
            "user_id": user_id,
            "date": order_date,
            "status": status,
            "items": items,
            "shipping_address": f"{random.randint(1, 999)} Main St, Anytown, ST {random.randint(10000, 99999)}",
            "total": round(total, 2),
            "tracking_number": f"TRK{random.randint(10000000, 99999999)}" if status != "Processing" else None
        }
        orders.append(order)
    
    return orders

def generate_support_faq():
    """Generate support FAQ data"""
    faqs = [
        {
            "id": 1,
            "question": "How do I return an item?",
            "answer": "To return an item, go to your order history, select the order, and click 'Return Item'. Follow the instructions to print a return label. You have 30 days from the delivery date to initiate a return."
        },
        {
            "id": 2,
            "question": "When will I receive my refund?",
            "answer": "Refunds are processed within 3-5 business days after we receive your returned item. The funds may take an additional 2-7 business days to appear in your account depending on your payment method and financial institution."
        },
        {
            "id": 3,
            "question": "Can I change my shipping address?",
            "answer": "You can change your shipping address if your order hasn't been processed yet. Go to your order details and select 'Edit Shipping Information'. If your order has already been shipped, you'll need to contact customer support for assistance."
        },
        {
            "id": 4,
            "question": "Do you ship internationally?",
            "answer": "Yes, we ship to most countries worldwide. International shipping costs and delivery times vary by location. You can see the shipping options and costs during checkout before finalizing your purchase."
        },
        {
            "id": 5,
            "question": "How do I track my order?",
            "answer": "To track your order, log into your account, go to 'Order History', and select the order you want to track. Click on 'Track Package' to see the current status and estimated delivery date."
        }
    ]
    return faqs

# utils/logger.py
import logging
import datetime

def setup_logger():
    """Set up logging for the application"""
    # Create logger
    logger = logging.getLogger('ecommerce_ai')
    logger.setLevel(logging.INFO)
    
    # Create file handler
    log_file = f"logs/app_{datetime.datetime.now().strftime('%Y%m%d')}.log"
    file_handler = logging.FileHandler(log_file)
    
    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    
    return logger