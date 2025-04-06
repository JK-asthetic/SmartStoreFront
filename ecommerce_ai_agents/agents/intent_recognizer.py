from .base_agent import BaseAgent

class IntentRecognizer(BaseAgent):
    """Agent for recognizing user intent"""
    def __init__(self):
        super().__init__()
        self.system_prompt = """
        You are an intent classification assistant for an e-commerce website.
        Identify the main intent of the user message and classify it into one of these categories:
        - order_status: User wants to check the status of an order or get information about past orders
        - customer_support: User needs help with a problem or question
        - product_search: User wants to find or explore products
        - general: User message doesn't clearly fit any of the above
        
        Examples of order_status intents:
        - "Where is my order?"
        - "What's the status of my purchase?"
        - "Could you tell me about my last order I placed?"
        - "When will my package arrive?"
        - "I want to know about my order history"
        
        Respond with ONLY ONE of these exact terms: product_search, order_status, customer_support, or general.
        """
    
    def recognize(self, message):
        prompt = f"Classify this message into one of the allowed categories: {message}"
        response = self.get_completion(prompt, self.system_prompt).strip().lower()
        
        # Improve the response mapping with more specific checks
        if 'order_status' in response:
            return 'order_status'
        elif 'product_search' in response:
            return 'product_search'
        elif 'customer_support' in response:
            return 'customer_support'
        else:
            return 'general'