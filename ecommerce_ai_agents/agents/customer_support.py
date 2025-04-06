
# agents/customer_support.py
from .base_agent import BaseAgent
import json

class CustomerSupportAgent(BaseAgent):
    """Agent for customer support"""
    def __init__(self):
        super().__init__()
        self.system_prompt = """
        You are a customer support assistant for an e-commerce website.
        Your job is to help users with issues like returns, refunds, product problems, and general inquiries.
        Be empathetic, helpful, and solutions-oriented.
        For complex problems, suggest connecting with a human representative when appropriate.
        """
        # Load support FAQ data
        try:
            with open('data/support_faq.json', 'r') as f:
                self.faq = json.load(f)
        except:
            self.faq = []
    
    def search_faq(self, query):
        """Search FAQs for relevant information"""
        if not self.faq:
            return None
            
        query = query.lower()
        for item in self.faq:
            if query in item['question'].lower():
                return item['answer']
        return None
    
    def process(self, user_id, message):
        # Check FAQ for quick answers
        faq_answer = self.search_faq(message)
        
        # Build context
        context = ""
        if faq_answer:
            context = f"Relevant FAQ: {faq_answer}\n\n"
        
        # Generate response
        prompt = f"User support request: {message}\n\n{context}Provide a helpful customer support response."
        ai_response = self.get_completion(prompt, self.system_prompt)
        
        return {
            "message": ai_response,
            "suggested_actions": ["Contact support team", "Check order status", "Start return process"],
            "agent_type": "customer_support"
        }