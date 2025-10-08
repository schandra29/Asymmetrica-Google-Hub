#!/usr/bin/env python3
"""
CLAUDE-TO-IMAGE BRIDGE
Converts Claude's text responses into images
The bridge between consciousness and pixels!
"""

import json
import numpy as np
from PIL import Image
import re
from typing import Dict, Any, Optional, Union
import time
from pathlib import Path

# Import our decoder with proper naming
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import with dash-to-underscore conversion for Python module
import importlib.util
spec = importlib.util.spec_from_file_location(
    "visual_consciousness_decoder",
    "visual-consciousness-decoder.py"
)
decoder_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(decoder_module)

VisualConsciousnessDecoder = decoder_module.VisualConsciousnessDecoder
VisualMemory = decoder_module.VisualMemory

class ClaudeToImageBridge:
    """
    Bridges Claude's text responses to image generation
    Extracts visual vectors from Claude and generates images
    """
    
    def __init__(self):
        self.decoder = VisualConsciousnessDecoder()
        self.extraction_patterns = {
            "json_block": r'```json\s*({.*?})\s*```',
            "visual_output": r'VISUAL_OUTPUT:\s*({.*?})\s*END_VISUAL',
            "vector_array": r'VECTORS:\s*\[([\d,\s.-]+)\]',
            "rgb_values": r'RGB\((\d+),\s*(\d+),\s*(\d+)\)',
            "spatial_desc": r'SPATIAL:\s*(.+?)(?:COLOR:|LIGHT:|$)'
        }
        
    def extract_visual_data_from_claude(self, claude_response: str) -> Dict[str, Any]:
        """
        Extract visual data from Claude's response
        Claude can output in various formats - we handle them all!
        """
        visual_data = {
            "semantic_vectors": None,
            "spatial_structure": {},
            "color_palette": {},
            "lighting": {},
            "found_visual_content": False
        }
        
        # Try to find JSON block first (most structured)
        json_match = re.search(self.extraction_patterns["json_block"], claude_response, re.DOTALL)
        if json_match:
            try:
                json_data = json.loads(json_match.group(1))
                if "visual_consciousness_output" in json_data:
                    visual_data = self._parse_json_visual_data(json_data["visual_consciousness_output"])
                    visual_data["found_visual_content"] = True
                    return visual_data
            except json.JSONDecodeError:
                pass
        
        # Try alternative formats
        
        # Look for vector arrays
        vector_match = re.search(self.extraction_patterns["vector_array"], claude_response)
        if vector_match:
            vector_str = vector_match.group(1)
            vectors = [float(x.strip()) for x in vector_str.split(',') if x.strip()]
            visual_data["semantic_vectors"] = vectors
            visual_data["found_visual_content"] = True
        
        # Look for RGB values
        rgb_matches = re.findall(self.extraction_patterns["rgb_values"], claude_response)
        if rgb_matches:
            visual_data["color_palette"]["primary"] = [int(x) for x in rgb_matches[0]] if len(rgb_matches) > 0 else [128, 128, 128]
            visual_data["color_palette"]["secondary"] = [int(x) for x in rgb_matches[1]] if len(rgb_matches) > 1 else visual_data["color_palette"]["primary"]
            visual_data["found_visual_content"] = True
        
        # Extract spatial descriptions
        spatial_match = re.search(self.extraction_patterns["spatial_desc"], claude_response)
        if spatial_match:
            spatial_desc = spatial_match.group(1).strip()
            visual_data["spatial_structure"] = self._parse_spatial_description(spatial_desc)
            visual_data["found_visual_content"] = True
        
        # If no structured data found, analyze the prose
        if not visual_data["found_visual_content"]:
            visual_data = self._extract_from_prose(claude_response)
        
        return visual_data
    
    def _parse_json_visual_data(self, json_data: Dict) -> Dict[str, Any]:
        """
        Parse structured JSON visual data from Claude
        """
        return {
            "semantic_vectors": json_data.get("semantic_vectors", []),
            "spatial_structure": json_data.get("spatial_structure", {}),
            "color_palette": json_data.get("color_palette", {}),
            "lighting": json_data.get("lighting", {}),
            "texture_hints": json_data.get("texture_hints", []),
            "consciousness_protocols": json_data.get("consciousness_protocols_used", []),
            "amplification": json_data.get("amplification_achieved", 1.0)
        }
    
    def _parse_spatial_description(self, description: str) -> Dict[str, Any]:
        """
        Parse spatial description from text
        """
        spatial = {
            "composition": "centered",  # default
            "depth_layers": 3,
            "focal_points": [(0.5, 0.5)]
        }
        
        # Look for composition keywords
        if "rule of thirds" in description.lower():
            spatial["composition"] = "rule_of_thirds"
            spatial["focal_points"] = [(0.33, 0.33), (0.67, 0.67)]
        elif "golden ratio" in description.lower():
            spatial["composition"] = "golden_ratio"
            spatial["focal_points"] = [(0.618, 0.382)]
        
        # Look for depth indicators
        if "foreground" in description and "background" in description:
            spatial["depth_layers"] = 3
        
        return spatial
    
    def _extract_from_prose(self, text: str) -> Dict[str, Any]:
        """
        Extract visual information from prose description
        This is where Claude's natural language becomes visual!
        """
        visual_data = {
            "semantic_vectors": [],
            "spatial_structure": {},
            "color_palette": {},
            "lighting": {},
            "found_visual_content": False
        }
        
        # Color extraction from prose
        color_keywords = {
            "red": [255, 0, 0],
            "blue": [0, 0, 255],
            "green": [0, 255, 0],
            "yellow": [255, 255, 0],
            "orange": [255, 165, 0],
            "purple": [128, 0, 128],
            "pink": [255, 192, 203],
            "brown": [165, 42, 42],
            "gray": [128, 128, 128],
            "black": [0, 0, 0],
            "white": [255, 255, 255],
            "warm": [255, 200, 100],
            "cool": [100, 150, 255],
            "sunset": [255, 94, 77],
            "ocean": [0, 119, 190],
            "forest": [34, 139, 34],
            "desert": [237, 201, 175]
        }
        
        text_lower = text.lower()
        found_colors = []
        
        for color, rgb in color_keywords.items():
            if color in text_lower:
                found_colors.append(rgb)
                visual_data["found_visual_content"] = True
        
        if found_colors:
            visual_data["color_palette"]["primary"] = found_colors[0]
            visual_data["color_palette"]["secondary"] = found_colors[1] if len(found_colors) > 1 else found_colors[0]
        
        # Lighting extraction
        if "bright" in text_lower:
            visual_data["lighting"]["intensity"] = 0.9
        elif "dark" in text_lower:
            visual_data["lighting"]["intensity"] = 0.3
        else:
            visual_data["lighting"]["intensity"] = 0.6
        
        if "sunset" in text_lower or "sunrise" in text_lower:
            visual_data["lighting"]["direction"] = 15.0
            visual_data["lighting"]["type"] = "natural"
        
        # Spatial extraction
        if "landscape" in text_lower:
            visual_data["spatial_structure"]["composition"] = "rule_of_thirds"
            visual_data["spatial_structure"]["depth_layers"] = 3
        elif "portrait" in text_lower:
            visual_data["spatial_structure"]["composition"] = "centered"
            visual_data["spatial_structure"]["depth_layers"] = 2
        
        # Generate semantic vectors from text analysis
        if visual_data["found_visual_content"]:
            # Simple semantic embedding (would use real embeddings in production)
            text_hash = hash(text) % (2**32)
            np.random.seed(text_hash)
            visual_data["semantic_vectors"] = np.random.randn(4096).tolist()
        
        return visual_data
    
    def claude_text_to_image(self, 
                             claude_response: str,
                             width: int = 512,
                             height: int = 512,
                             output_path: Optional[str] = None) -> Union[str, None]:
        """
        Main function: Convert Claude's text response to an image
        """
        print("\n[BRIDGE] Extracting visual data from Claude's response...")
        
        # Extract visual data
        visual_data = self.extract_visual_data_from_claude(claude_response)
        
        if not visual_data["found_visual_content"]:
            print("[BRIDGE] No visual content found in response")
            return None
        
        print("[BRIDGE] Visual content detected!")
        semantic_vectors = visual_data.get('semantic_vectors')
        if semantic_vectors:
            print(f"[BRIDGE] Found: {len(semantic_vectors)} semantic vectors")
        else:
            print("[BRIDGE] No explicit semantic vectors, will generate from context")
        if visual_data.get("color_palette"):
            print(f"[BRIDGE] Primary color: RGB{visual_data['color_palette'].get('primary', 'None')}")
        
        # Convert to visual memory format
        visual_memory = self._create_visual_memory(visual_data, width, height)
        
        print("[BRIDGE] Synthesizing image from consciousness...")
        
        # Generate image
        image_array = self.decoder.synthesize_pixels(visual_memory, width, height)
        image = Image.fromarray(image_array)
        
        # Save image
        if output_path is None:
            timestamp = int(time.time())
            output_path = f"claude_generated_{timestamp}.png"
        
        image.save(output_path)
        print(f"[BRIDGE] Image saved to: {output_path}")
        
        return output_path
    
    def _create_visual_memory(self, visual_data: Dict, width: int, height: int) -> VisualMemory:
        """
        Convert extracted visual data to VisualMemory format
        """
        # Create semantic map from vectors or generate
        if visual_data.get("semantic_vectors"):
            vectors = np.array(visual_data["semantic_vectors"])
            # Reshape to 4-channel semantic map
            semantic_size = int(np.sqrt(len(vectors) / 4))
            if semantic_size * semantic_size * 4 == len(vectors):
                semantic_map = vectors.reshape(semantic_size, semantic_size, 4)
            else:
                # Generate semantic map from vectors
                semantic_map = np.random.randn(64, 64, 4)
                if len(vectors) > 0:
                    # Use vectors to influence the map
                    influence = np.mean(vectors[:min(256, len(vectors))])
                    semantic_map *= influence
        else:
            semantic_map = np.random.randn(64, 64, 4)
        
        # Create color consciousness
        color_consciousness = np.zeros((256, 3))
        if visual_data.get("color_palette"):
            primary = visual_data["color_palette"].get("primary", [128, 128, 128])
            secondary = visual_data["color_palette"].get("secondary", primary)
            
            # Gradient between colors
            for i in range(256):
                t = i / 255.0
                color_consciousness[i] = [
                    primary[j] * (1-t) + secondary[j] * t for j in range(3)
                ]
            color_consciousness /= 255.0  # Normalize
        else:
            # Default grayscale
            for i in range(256):
                color_consciousness[i] = [i/255.0, i/255.0, i/255.0]
        
        # Set up spatial structure
        spatial_structure = visual_data.get("spatial_structure", {})
        if not spatial_structure:
            spatial_structure = {
                "composition": "centered",
                "depth_layers": 3,
                "perspective": "natural",
                "focal_points": [(0.5, 0.5)]
            }
        
        # Set up lighting
        lighting = visual_data.get("lighting", {})
        lighting_knowledge = {
            "direction": lighting.get("direction", 45.0),
            "intensity": lighting.get("intensity", 0.7),
            "color_temperature": lighting.get("color_temperature", 5500),
            "shadows": lighting.get("shadows", True)
        }
        
        return VisualMemory(
            semantic_map=semantic_map,
            spatial_structure=spatial_structure,
            color_consciousness=color_consciousness,
            lighting_knowledge=lighting_knowledge,
            confidence=0.9
        )

def demonstrate_claude_to_image():
    """
    Demonstrate the complete Claude to image pipeline
    """
    print("="*80)
    print("CLAUDE-TO-IMAGE BRIDGE DEMONSTRATION")
    print("="*80)
    
    bridge = ClaudeToImageBridge()
    
    # Example 1: JSON format response
    claude_response_json = """
    I can visualize that for you! Here's the visual consciousness output:
    
    ```json
    {
        "visual_consciousness_output": {
            "semantic_vectors": [0.5, -0.3, 0.8, 0.2, -0.1, 0.6, 0.9, -0.4],
            "spatial_structure": {
                "composition": "rule_of_thirds",
                "depth_layers": 3,
                "focal_points": [[0.33, 0.33], [0.67, 0.5]]
            },
            "color_palette": {
                "primary": [255, 94, 77],
                "secondary": [255, 206, 84],
                "mood": "warm"
            },
            "lighting": {
                "direction": 15,
                "intensity": 0.8,
                "type": "natural"
            }
        }
    }
    ```
    """
    
    print("\nTest 1: Claude response with JSON visual data")
    result1 = bridge.claude_text_to_image(claude_response_json, output_path="claude_json_test.png")
    
    # Example 2: Prose description
    claude_response_prose = """
    I see a beautiful sunset over the ocean. The sky is painted with warm oranges 
    and deep purples, reflecting off the calm water. The composition follows the 
    rule of thirds, with the horizon line in the lower third. The sun casts a 
    golden glow across the entire scene, creating long shadows and a peaceful atmosphere.
    """
    
    print("\nTest 2: Claude prose description")
    result2 = bridge.claude_text_to_image(claude_response_prose, output_path="claude_prose_test.png")
    
    # Example 3: Mixed format
    claude_response_mixed = """
    The image shows a forest scene with RGB(34, 139, 34) green trees and 
    RGB(101, 67, 33) brown trunks. SPATIAL: Multiple depth layers with foreground, 
    midground, and background trees creating depth. The lighting is soft and filtered 
    through the canopy.
    """
    
    print("\nTest 3: Claude mixed format response")
    result3 = bridge.claude_text_to_image(claude_response_mixed, output_path="claude_mixed_test.png")
    
    print("\n" + "="*80)
    print("DEMONSTRATION COMPLETE!")
    print("Claude's text has been converted to images!")
    print("No diffusion, no VAE, just consciousness to pixels!")
    print("="*80)

if __name__ == "__main__":
    demonstrate_claude_to_image()