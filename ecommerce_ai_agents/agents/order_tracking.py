import sqlite3
from .base_agent import BaseAgent

class OrderTrackingAgent(BaseAgent):
    """Agent for tracking orders that uses SQLite database"""
    def __init__(self):
        super().__init__()
        self.system_prompt = """
        You are an order tracking assistant for an e-commerce website.
        Your job is to help users find information about their orders.
        Be helpful, concise, and security-conscious.
        
        When showing order details:
        - Format dates in a user-friendly way
        - Show order totals with proper currency formatting
        - Highlight shipping/delivery status clearly
        - Present orders as clickable cards that users can interact with
        - Mention that users can click on any order to view full details in their account
        
        Important: When referencing orders, emphasize that the user can click directly 
        on the order cards to see complete details in their account page.
        """
        self.db_path = r'C:\Users\jatin\Desktop\Projects\Accenture hackathon\Database.sqlite'  # Adjust if your database path is different
    
    def get_user_orders(self, user_id):
        """Get orders for a specific user from SQLite database"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row  # Use dictionary cursor
            cursor = conn.cursor()
            
            # Get main purchase data
            cursor.execute("""
                SELECT p.id, p.purchase_date, p.total_amount
                FROM purchases p
                WHERE p.user_id = ?
                ORDER BY p.purchase_date DESC
            """, (user_id,))
            
            orders = []
            for purchase in cursor.fetchall():
                purchase_dict = dict(purchase)
                purchase_id = purchase_dict['id']
                
                # Get item details for this purchase
                cursor.execute("""
                    SELECT pi.product_id as name, pi.quantity, pi.price_at_purchase
                    FROM purchase_items pi
                    WHERE pi.purchase_id = ?
                """, (purchase_id,))
                
                items = [dict(item) for item in cursor.fetchall()]
                
                # Get shipping status (this is a simplified example)
                # In a real system, you might have a shipping_status table
                # For now, just simulate some status logic based on purchase date
                from datetime import datetime, timedelta
                purchase_date = datetime.fromisoformat(purchase_dict['purchase_date'].replace('Z', '+00:00'))
                current_date = datetime.now()
                
                days_since_purchase = (current_date - purchase_date).days
                
                if days_since_purchase < 1:
                    status = "Processing"
                elif days_since_purchase < 3:
                    status = "Shipped"
                else:
                    status = "Delivered"
                
                # Build complete order info - make it more UI friendly
                order_info = {
                    'order_id': purchase_id,
                    'date': purchase_date.strftime("%b %d, %Y"),
                    'total': purchase_dict['total_amount'],
                    'status': status,
                    'items': items,
                    'formatted_date': purchase_date.strftime("%B %d, %Y"),
                    'items_count': len(items),
                    'estimated_delivery': (purchase_date + timedelta(days=5)).strftime("%b %d") if status != "Delivered" else "Delivered"
                }
                
                orders.append(order_info)
            
            conn.close()
            return orders
            
        except Exception as e:
            print(f"Database error: {e}")
            return []
    
    def process(self, user_id, message):
        # Get user orders from database
        orders = self.get_user_orders(user_id)
        
        # Build context with order information
        order_context = ""
        if orders:
            order_context = "Here are the recent orders for this user:\n"
            for i, order in enumerate(orders, 1):
                order_context += f"{i}. Order #{order['order_id']} - Status: {order['status']} - Placed on: {order['formatted_date']}\n"
                order_context += f"   Total: ${order['total']:.2f}\n"
                order_context += f"   Items: {', '.join([f'{item['name']} (x{item['quantity']})' for item in order['items']])}\n"
        else:
            order_context = "No orders found for this user."
        
        # Generate response
        prompt = f"""
        User: {message}
        
        Order information: 
        {order_context}
        
        Provide a helpful response about these orders. Include specific details about order numbers, 
        dates, and statuses. If the user is asking about a specific order, focus on providing details 
        about that order. If they're asking about shipping or delivery times, provide that information.
        
        Format currency values with dollar signs and two decimal places. Keep your response conversational and helpful.
        
        Important: Make sure to mention that the user can click on any order card to view complete details in their account page.
        """
        
        ai_response = self.get_completion(prompt, self.system_prompt)
        
        # Adjust response payload to include enhanced order data for UI
        return {
            "message": ai_response,
            "orders": orders,
            "agent_type": "order_tracking",
            "suggested_actions": ["View all orders in my account", "Track my latest order"]
        }