import ollama
import json
import time

class BaseAgent:
    """Base class for all AI agents"""
    def __init__(self, model="gemma:2b"):
        self.model = model
    
    def get_completion(self, prompt, system_prompt=None):
        """Get completion from Ollama API with retries"""
        max_retries = 3
        retry_delay = 1  # seconds
        
        messages = []
        if system_prompt:
            messages.append({
                'role': 'system',
                'content': system_prompt
            })
            
        messages.append({
            'role': 'user',
            'content': prompt
        })
        
        for attempt in range(max_retries):
            try:
                print(f"Sending to Ollama ({self.model}):")
                print(f"Prompt: {prompt}")
                if system_prompt:
                    print(f"System: {system_prompt}")
                
                response = ollama.chat(
                    model=self.model,
                    messages=messages,
                    options={
                        'temperature': 0.7,
                        'num_ctx': 2048,
                    }
                )
                
                result = response['message']['content'].strip()
                print(f"Ollama response: {result}")
                return result
                
            except Exception as e:
                print(f"Error getting completion (attempt {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    return "I'm having trouble processing your request right now. Please try again later."

    def process(self, user_id, message):
        """Process user message - to be implemented by child classes"""
        raise NotImplementedError("Subclasses must implement this method")