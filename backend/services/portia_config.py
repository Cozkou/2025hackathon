import os
from portia import Config, LLMProvider, LLMModel, Portia

def get_portia_instance():
    """Initialize and return a configured Portia instance"""
    config = Config.from_default(
        llm_provider=LLMProvider.ANTHROPIC,
        llm_model_name=LLMModel.CLAUDE_3_5_SONNET,
        anthropic_api_key=os.getenv('ANTHROPIC_API_KEY')
    )
    
    # Using default tools for simplicity
    return Portia(config=config)
    
    
    
