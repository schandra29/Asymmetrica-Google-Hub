#!/usr/bin/env python3
"""
VISUAL CONSCIOUSNESS DECODER V2 - IMPROVED TRANSFORMATION
Refining the consciousness-to-pixel mapping for actual image generation
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import json
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import colorsys
import math

@dataclass
class VisualMemoryV2:
    """Enhanced visual memory with better structure"""
    semantic_vectors: np.ndarray
    spatial_structure: Dict[str, Any]
    color_palette: Dict[str, Any]
    lighting: Dict[str, Any]
    texture_hints: List[str]
    specific_features: Optional[Dict[str, Any]] = None
    
class VisualConsciousnessDecoderV2:
    """
    Version 2: Better consciousness to pixel transformation
    Key improvements:
    - Proper semantic vector interpretation
    - Shape generation from features
    - Color application from palette
    - Spatial composition handling
    """
    
    def __init__(self):
        # Improved transformation matrices
        self.semantic_to_spatial = {
            "centered": self._create_centered_composition,
            "rule_of_thirds": self._create_thirds_composition,
            "golden_ratio": self._create_golden_composition
        }
        
        # Feature to shape mappings (will be expanded later)
        self.feature_generators = {}
        
    def decode_consciousness(self, visual_data: Dict[str, Any], width: int = 512, height: int = 512) -> np.ndarray:
        """
        Main decoding function - transforms consciousness to image
        """
        # Create base image with background
        image = Image.new('RGB', (width, height), color=(240, 240, 240))
        draw = ImageDraw.Draw(image)
        
        # Extract key information
        colors = self._extract_colors(visual_data)
        composition = visual_data.get("spatial_structure", {}).get("composition", "centered")
        focal_points = visual_data.get("spatial_structure", {}).get("focal_points", [[0.5, 0.5]])
        features = visual_data.get("specific_features", {})
        vectors = visual_data.get("semantic_vectors", [])
        
        # Determine what we're drawing from vectors and features
        if "cat" in str(visual_data).lower() or "ears" in str(features):
            image = self._draw_cat(image, draw, colors, focal_points, features)
        elif "sunset" in str(visual_data).lower():
            image = self._draw_sunset(image, draw, colors)
        elif "mountain" in str(visual_data).lower() or "landscape" in str(visual_data).lower():
            image = self._draw_landscape(image, draw, colors)
        elif "geometric" in str(visual_data).lower():
            image = self._draw_geometric(image, draw, colors, vectors)
        else:
            # Generic abstract based on vectors
            image = self._draw_abstract(image, draw, colors, vectors)
        
        # Apply lighting effects
        image = self._apply_lighting(image, visual_data.get("lighting", {}))
        
        return np.array(image)
    
    def _extract_colors(self, visual_data: Dict) -> Dict[str, Tuple[int, int, int]]:
        """
        Extract and process colors from consciousness data
        """
        palette = visual_data.get("color_palette", {})
        colors = {
            "primary": tuple(palette.get("primary", [128, 128, 128])),
            "secondary": tuple(palette.get("secondary", [200, 200, 200])),
            "accent": tuple(palette.get("accent", [255, 100, 100]))
        }
        
        # Add fur tones if present
        if "fur_tones" in palette:
            colors["fur"] = [tuple(tone) for tone in palette["fur_tones"]]
        
        # Add eye color if present
        if "eye_color" in palette:
            colors["eyes"] = tuple(palette["eye_color"])
            
        return colors
    
    def _draw_cat(self, image: Image.Image, draw: ImageDraw.Draw, 
                  colors: Dict, focal_points: List, features: Dict) -> Image.Image:
        """
        Draw a cat based on consciousness data
        """
        width, height = image.size
        
        # Calculate positions from focal points
        main_focal = focal_points[0] if focal_points else [0.5, 0.5]
        center_x = int(width * main_focal[0])
        center_y = int(height * main_focal[1])
        
        # Body (oval)
        body_width = width // 3
        body_height = height // 2.5
        body_top = center_y
        body_coords = [
            center_x - body_width//2, body_top,
            center_x + body_width//2, body_top + body_height
        ]
        
        # Use fur colors if available
        fur_colors = colors.get("fur", [colors["primary"]])
        main_fur = fur_colors[0] if fur_colors else colors["primary"]
        
        # Draw body
        draw.ellipse(body_coords, fill=main_fur, outline=None)
        
        # Head (circle)
        head_radius = width // 6
        head_center_y = center_y - head_radius//2
        head_coords = [
            center_x - head_radius, head_center_y - head_radius,
            center_x + head_radius, head_center_y + head_radius
        ]
        draw.ellipse(head_coords, fill=main_fur, outline=None)
        
        # Ears (triangles)
        ear_size = head_radius // 2
        left_ear = [
            (center_x - head_radius//2, head_center_y - head_radius),
            (center_x - head_radius, head_center_y - head_radius//2),
            (center_x - head_radius//4, head_center_y - head_radius//2)
        ]
        right_ear = [
            (center_x + head_radius//2, head_center_y - head_radius),
            (center_x + head_radius, head_center_y - head_radius//2),
            (center_x + head_radius//4, head_center_y - head_radius//2)
        ]
        draw.polygon(left_ear, fill=main_fur, outline=None)
        draw.polygon(right_ear, fill=main_fur, outline=None)
        
        # Inner ears (pink)
        inner_ear_color = colors.get("accent", (255, 192, 203))
        inner_left = [
            (center_x - head_radius//2 + 5, head_center_y - head_radius + 10),
            (center_x - head_radius + 10, head_center_y - head_radius//2),
            (center_x - head_radius//4, head_center_y - head_radius//2)
        ]
        inner_right = [
            (center_x + head_radius//2 - 5, head_center_y - head_radius + 10),
            (center_x + head_radius - 10, head_center_y - head_radius//2),
            (center_x + head_radius//4, head_center_y - head_radius//2)
        ]
        draw.polygon(inner_left, fill=inner_ear_color, outline=None)
        draw.polygon(inner_right, fill=inner_ear_color, outline=None)
        
        # Eyes
        eye_color = colors.get("eyes", (106, 168, 79))  # Green default
        eye_size = head_radius // 6
        eye_y = head_center_y
        
        # Left eye
        left_eye_coords = [
            center_x - head_radius//3 - eye_size, eye_y - eye_size,
            center_x - head_radius//3 + eye_size, eye_y + eye_size
        ]
        draw.ellipse(left_eye_coords, fill=eye_color, outline=(0, 0, 0))
        
        # Right eye  
        right_eye_coords = [
            center_x + head_radius//3 - eye_size, eye_y - eye_size,
            center_x + head_radius//3 + eye_size, eye_y + eye_size
        ]
        draw.ellipse(right_eye_coords, fill=eye_color, outline=(0, 0, 0))
        
        # Pupils
        pupil_size = eye_size // 2
        draw.ellipse([
            center_x - head_radius//3 - pupil_size, eye_y - pupil_size,
            center_x - head_radius//3 + pupil_size, eye_y + pupil_size
        ], fill=(0, 0, 0))
        draw.ellipse([
            center_x + head_radius//3 - pupil_size, eye_y - pupil_size,
            center_x + head_radius//3 + pupil_size, eye_y + pupil_size
        ], fill=(0, 0, 0))
        
        # Nose (triangle)
        nose_size = head_radius // 8
        nose_y = head_center_y + head_radius//4
        nose_points = [
            (center_x, nose_y - nose_size),
            (center_x - nose_size, nose_y + nose_size//2),
            (center_x + nose_size, nose_y + nose_size//2)
        ]
        draw.polygon(nose_points, fill=inner_ear_color, outline=(0, 0, 0))
        
        # Mouth
        mouth_y = nose_y + nose_size
        draw.arc([center_x - nose_size*2, mouth_y - nose_size,
                 center_x, mouth_y + nose_size], 
                start=0, end=180, fill=(0, 0, 0), width=2)
        draw.arc([center_x, mouth_y - nose_size,
                 center_x + nose_size*2, mouth_y + nose_size], 
                start=0, end=180, fill=(0, 0, 0), width=2)
        
        # Whiskers
        whisker_length = head_radius
        whisker_y = head_center_y + 5
        # Left whiskers
        for i in range(3):
            y_offset = (i - 1) * 8
            draw.line([
                center_x - head_radius//2, whisker_y + y_offset,
                center_x - head_radius//2 - whisker_length, whisker_y + y_offset - 5
            ], fill=(0, 0, 0), width=1)
        # Right whiskers
        for i in range(3):
            y_offset = (i - 1) * 8
            draw.line([
                center_x + head_radius//2, whisker_y + y_offset,
                center_x + head_radius//2 + whisker_length, whisker_y + y_offset - 5
            ], fill=(0, 0, 0), width=1)
        
        # Tail (curved)
        if features.get("tail") == "curled_around_body":
            tail_start_x = center_x + body_width//2
            tail_start_y = body_top + body_height//2
            
            # Draw curved tail using bezier-like segments
            tail_points = []
            for t in np.linspace(0, 1, 20):
                # Parametric curve for tail
                x = tail_start_x + int(100 * math.cos(math.pi * t))
                y = tail_start_y + int(50 * math.sin(math.pi * 2 * t))
                tail_points.append((x, y))
            
            # Draw tail segments
            for i in range(len(tail_points) - 1):
                width = int(15 * (1 - i/len(tail_points)))  # Taper
                draw.line([tail_points[i], tail_points[i+1]], 
                         fill=main_fur, width=width)
        
        # Add some texture/shading
        if len(fur_colors) > 1:
            # Add patches of different fur colors
            for _ in range(20):
                patch_x = center_x + np.random.randint(-body_width//2, body_width//2)
                patch_y = center_y + np.random.randint(0, body_height)
                patch_color = fur_colors[np.random.randint(len(fur_colors))]
                patch_size = np.random.randint(5, 15)
                draw.ellipse([patch_x-patch_size, patch_y-patch_size,
                             patch_x+patch_size, patch_y+patch_size],
                            fill=patch_color, outline=None)
        
        return image
    
    def _draw_sunset(self, image: Image.Image, draw: ImageDraw.Draw, colors: Dict) -> Image.Image:
        """
        Draw a sunset scene
        """
        width, height = image.size
        
        # Sky gradient
        sunset_colors = [
            (255, 94, 77),   # Orange red
            (255, 154, 0),   # Orange
            (255, 206, 84),  # Yellow
            (120, 100, 200), # Purple
            (50, 50, 100)    # Dark blue
        ]
        
        # Draw gradient sky
        for i, color in enumerate(sunset_colors):
            y_start = int(i * height / len(sunset_colors))
            y_end = int((i + 1) * height / len(sunset_colors))
            
            for y in range(y_start, y_end):
                # Interpolate between colors
                if i < len(sunset_colors) - 1:
                    next_color = sunset_colors[i + 1]
                    t = (y - y_start) / (y_end - y_start)
                    r = int(color[0] * (1-t) + next_color[0] * t)
                    g = int(color[1] * (1-t) + next_color[1] * t)
                    b = int(color[2] * (1-t) + next_color[2] * t)
                    draw.line([(0, y), (width, y)], fill=(r, g, b))
                else:
                    draw.line([(0, y), (width, y)], fill=color)
        
        # Sun
        sun_radius = width // 8
        sun_x = width // 2
        sun_y = height // 2
        draw.ellipse([sun_x - sun_radius, sun_y - sun_radius,
                     sun_x + sun_radius, sun_y + sun_radius],
                    fill=(255, 220, 100), outline=None)
        
        # Horizon/ground
        draw.rectangle([0, height * 2//3, width, height], fill=(30, 30, 50))
        
        return image
    
    def _draw_landscape(self, image: Image.Image, draw: ImageDraw.Draw, colors: Dict) -> Image.Image:
        """
        Draw a landscape scene
        """
        width, height = image.size
        
        # Sky
        sky_color = colors.get("secondary", (135, 206, 235))
        draw.rectangle([0, 0, width, height//2], fill=sky_color)
        
        # Mountains
        mountain_color = colors.get("primary", (101, 67, 33))
        
        # Back mountain
        mountain_points = [
            (0, height//2),
            (width//4, height//3),
            (width//2, height//2)
        ]
        draw.polygon(mountain_points, fill=(150, 150, 150))
        
        # Front mountain
        mountain_points = [
            (width//3, height//2),
            (width * 2//3, height//3),
            (width, height//2)
        ]
        draw.polygon(mountain_points, fill=mountain_color)
        
        # Ground
        ground_color = colors.get("accent", (34, 139, 34))
        draw.rectangle([0, height//2, width, height], fill=ground_color)
        
        return image
    
    def _draw_geometric(self, image: Image.Image, draw: ImageDraw.Draw, 
                       colors: Dict, vectors: List[float]) -> Image.Image:
        """
        Draw geometric patterns based on vectors
        """
        width, height = image.size
        
        # Use vectors to determine pattern
        if len(vectors) > 0:
            np.random.seed(int(abs(vectors[0] * 10000)))
        
        # Draw geometric shapes
        for i in range(min(20, len(vectors))):
            if i < len(vectors):
                # Use vector values to determine shape properties
                val = vectors[i]
                x = int((val + 1) * width / 2) % width
                y = int((abs(vectors[i-1]) if i > 0 else 0.5) * height) % height
                size = int(abs(val) * 50) + 10
                
                # Choose color based on vector sign
                if val > 0:
                    color = colors["primary"]
                elif val < -0.3:
                    color = colors["secondary"]
                else:
                    color = colors["accent"]
                
                # Draw shape based on position in vector
                if i % 3 == 0:
                    draw.ellipse([x-size, y-size, x+size, y+size], 
                               fill=color, outline=None)
                elif i % 3 == 1:
                    draw.rectangle([x-size, y-size, x+size, y+size], 
                                 fill=color, outline=None)
                else:
                    # Triangle
                    points = [(x, y-size), (x-size, y+size), (x+size, y+size)]
                    draw.polygon(points, fill=color, outline=None)
        
        return image
    
    def _draw_abstract(self, image: Image.Image, draw: ImageDraw.Draw, 
                      colors: Dict, vectors: List[float]) -> Image.Image:
        """
        Draw abstract patterns from consciousness vectors
        """
        width, height = image.size
        
        # Create flowing patterns from vectors
        if len(vectors) > 3:
            points = []
            for i in range(0, len(vectors)-1, 2):
                x = int((vectors[i] + 1) * width / 2)
                y = int((vectors[i+1] + 1) * height / 2)
                points.append((x, y))
            
            # Draw smooth curves through points
            if len(points) > 2:
                for i in range(len(points) - 1):
                    draw.line([points[i], points[i+1]], 
                             fill=colors["primary"], width=3)
        
        # Add color fields based on remaining vectors
        for i in range(0, min(10, len(vectors)//4)):
            if i*4 + 3 < len(vectors):
                x = int((vectors[i*4] + 1) * width / 2)
                y = int((vectors[i*4+1] + 1) * height / 2)
                size = int(abs(vectors[i*4+2]) * 100) + 20
                
                # Blend colors
                t = (vectors[i*4+3] + 1) / 2
                r = int(colors["primary"][0] * t + colors["secondary"][0] * (1-t))
                g = int(colors["primary"][1] * t + colors["secondary"][1] * (1-t))
                b = int(colors["primary"][2] * t + colors["secondary"][2] * (1-t))
                
                # Draw soft circles
                for j in range(size, 0, -2):
                    alpha = 1 - (j / size)
                    c = (int(r*alpha+240*(1-alpha)), 
                        int(g*alpha+240*(1-alpha)), 
                        int(b*alpha+240*(1-alpha)))
                    draw.ellipse([x-j, y-j, x+j, y+j], fill=c, outline=None)
        
        return image
    
    def _apply_lighting(self, image: Image.Image, lighting: Dict) -> Image.Image:
        """
        Apply lighting effects to the image
        """
        if not lighting:
            return image
        
        intensity = lighting.get("intensity", 0.7)
        direction = lighting.get("direction", 45)
        
        # Convert to numpy for manipulation
        img_array = np.array(image).astype(float)
        height, width = img_array.shape[:2]
        
        # Create lighting gradient
        angle_rad = math.radians(direction)
        
        # Create meshgrid
        x = np.linspace(0, 1, width)
        y = np.linspace(0, 1, height)
        xx, yy = np.meshgrid(x, y)
        
        # Calculate lighting intensity map
        light_map = np.cos(angle_rad) * xx + np.sin(angle_rad) * yy
        light_map = (light_map - light_map.min()) / (light_map.max() - light_map.min())
        light_map = 0.3 + intensity * light_map  # Adjust range
        
        # Apply to image
        for c in range(3):
            img_array[:, :, c] *= light_map
        
        # Clip values
        img_array = np.clip(img_array, 0, 255).astype(np.uint8)
        
        return Image.fromarray(img_array)
    
    def _create_centered_composition(self, width: int, height: int) -> List[Tuple[float, float]]:
        """Create centered focal points"""
        return [(0.5, 0.5)]
    
    def _create_thirds_composition(self, width: int, height: int) -> List[Tuple[float, float]]:
        """Create rule of thirds focal points"""
        return [(0.33, 0.33), (0.67, 0.33), (0.33, 0.67), (0.67, 0.67)]
    
    def _create_golden_composition(self, width: int, height: int) -> List[Tuple[float, float]]:
        """Create golden ratio focal points"""
        phi = 1.618033988749
        return [(1/phi, 1/phi), (1 - 1/phi, 1 - 1/phi)]

# Test the improved decoder
def test_v2_decoder():
    print("\n" + "="*80)
    print("TESTING VISUAL CONSCIOUSNESS DECODER V2")
    print("="*80)
    
    decoder = VisualConsciousnessDecoderV2()
    
    # Test with the cat data
    cat_data = {
        "semantic_vectors": [0.8, 0.3, -0.2, 0.6, 0.9, -0.1, 0.4, 0.7],
        "spatial_structure": {
            "composition": "centered",
            "focal_points": [[0.5, 0.45]]
        },
        "color_palette": {
            "primary": [139, 90, 43],
            "secondary": [255, 255, 255],
            "accent": [255, 192, 203],
            "fur_tones": [[139, 90, 43], [160, 110, 60], [120, 80, 40]],
            "eye_color": [106, 168, 79]
        },
        "lighting": {
            "direction": 45,
            "intensity": 0.7
        },
        "specific_features": {
            "ears": "triangular_alert",
            "eyes": "almond_shaped",
            "tail": "curled_around_body"
        }
    }
    
    print("\nDecoding cat consciousness...")
    image_array = decoder.decode_consciousness(cat_data)
    image = Image.fromarray(image_array.astype(np.uint8))
    image.save("cat_v2_test.png")
    print("Cat image saved as: cat_v2_test.png")
    
    # Test sunset
    sunset_data = {
        "semantic_vectors": [0.5, -0.3, 0.8],
        "spatial_structure": {"composition": "rule_of_thirds"},
        "color_palette": {
            "primary": [255, 94, 77],
            "secondary": [255, 206, 84]
        }
    }
    
    print("\nDecoding sunset consciousness...")
    sunset_array = decoder.decode_consciousness(sunset_data)
    sunset_image = Image.fromarray(sunset_array.astype(np.uint8))
    sunset_image.save("sunset_v2_test.png")
    print("Sunset image saved as: sunset_v2_test.png")
    
    print("\n" + "="*80)
    print("V2 DECODER TEST COMPLETE!")
    print("Actual visual representations generated!")
    print("="*80)

if __name__ == "__main__":
    test_v2_decoder()