import os
import logging
import asyncio
from typing import Optional, Dict, Any, List
from functools import lru_cache

import google.generativeai as genai
from google.generativeai.types import GenerationConfig
from vertexai.preview.generative_models import GenerativeModel, Part
from vertexai.preview import generative_models

from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiClient:
    """Client for interacting with Google's Gemini API"""
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-1.5-flash"):
        """
        Initialize the Gemini client
        
        Args:
            api_key: Google API key for Gemini (if None, will use environment variable)
            model_name: The Gemini model to use
        """
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY") or settings.GOOGLE_API_KEY
        self.model_name = model_name
        
        if not self.api_key:
            raise ValueError("Google API key not provided. Set GOOGLE_API_KEY environment variable or pass it directly.")
        
        # Configure the Gemini API
        genai.configure(api_key=self.api_key)
        
        # Initialize the model
        self.model = genai.GenerativeModel(self.model_name)
        logger.info(f"Initialized Gemini client with model: {self.model_name}")
    
    async def generate_content(
        self, 
        prompt: str, 
        generation_config: Optional[Dict[str, Any]] = None,
        safety_settings: Optional[Dict[str, Any]] = None
    ):
        """
        Generate content using the Gemini model
        
        Args:
            prompt: The text prompt to send to the model
            generation_config: Optional generation configuration parameters
            safety_settings: Optional safety settings
            
        Returns:
            The generated response
        """
        try:
            # Set default generation config if not provided
            if generation_config is None:
                generation_config = {
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 2048,
                }
            
            # Create generation config
            config = GenerationConfig(**generation_config)
            
            # Run in an executor to avoid blocking the event loop
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(
                    prompt,
                    generation_config=config,
                    safety_settings=safety_settings
                )
            )
            
            return response
        except Exception as e:
            logger.error(f"Error generating content with Gemini: {str(e)}")
            raise
    
    async def generate_structured_output(
        self, 
        prompt: str, 
        output_schema: Dict[str, Any],
        generation_config: Optional[Dict[str, Any]] = None
    ):
        """
        Generate structured output (JSON) using the Gemini model
        
        Args:
            prompt: The text prompt to send to the model
            output_schema: The JSON schema that defines the expected output structure
            generation_config: Optional generation configuration parameters
            
        Returns:
            The generated structured response
        """
        try:
            # Append schema instructions to the prompt
            schema_prompt = f"{prompt}\n\nPlease format your response as a JSON object with the following schema:\n{output_schema}"
            
            # Generate content
            response = await self.generate_content(schema_prompt, generation_config)
            
            return response
        except Exception as e:
            logger.error(f"Error generating structured output with Gemini: {str(e)}")
            raise
    
    async def analyze_document(self, document_content: str, instructions: str):
        """
        Analyze a document using the Gemini model
        
        Args:
            document_content: The content of the document to analyze
            instructions: Instructions for how to analyze the document
            
        Returns:
            The analysis results
        """
        try:
            prompt = f"""
            Instructions: {instructions}
            
            Document Content:
            {document_content}
            """
            
            response = await self.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.2,  # Lower temperature for more deterministic results
                    "max_output_tokens": 4096,
                }
            )
            
            return response
        except Exception as e:
            logger.error(f"Error analyzing document with Gemini: {str(e)}")
            raise
    
    async def multimodal_analysis(
        self, 
        text_prompt: str, 
        image_data: Optional[bytes] = None, 
        image_url: Optional[str] = None
    ):
        """
        Perform multimodal analysis with both text and image inputs
        
        Args:
            text_prompt: The text prompt to send to the model
            image_data: Optional binary image data
            image_url: Optional image URL (used if image_data is None)
            
        Returns:
            The analysis results
        """
        try:
            if not image_data and not image_url:
                raise ValueError("Either image_data or image_url must be provided")
            
            # For multimodal, we use the Vertex AI client directly
            model = GenerativeModel(self.model_name)
            
            parts = [text_prompt]
            
            if image_data:
                image_part = Part.from_data(image_data, mime_type="image/jpeg")
                parts.append(image_part)
            elif image_url:
                image_part = Part.from_uri(image_url, mime_type="image/jpeg")
                parts.append(image_part)
            
            # Run in an executor to avoid blocking the event loop
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: model.generate_content(parts)
            )
            
            return response
        except Exception as e:
            logger.error(f"Error performing multimodal analysis with Gemini: {str(e)}")
            raise


@lru_cache()
def get_gemini_client(model_name: str = "gemini-1.5-flash") -> GeminiClient:
    """
    Get a cached instance of the Gemini client
    
    Args:
        model_name: The Gemini model to use
        
    Returns:
        A GeminiClient instance
    """
    return GeminiClient(model_name=model_name)
