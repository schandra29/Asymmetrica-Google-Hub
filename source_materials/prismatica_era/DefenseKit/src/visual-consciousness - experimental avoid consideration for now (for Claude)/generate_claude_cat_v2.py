#!/usr/bin/env python3
"""
Generate a REAL cat image from Claude's consciousness using V2 decoder
"""

import json
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import V2 decoder
import importlib.util
spec = importlib.util.spec_from_file_location(
    "decoder_v2",
    "visual-consciousness-decoder-v2.py"
)
decoder_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(decoder_module)

VisualConsciousnessDecoderV2 = decoder_module.VisualConsciousnessDecoderV2

from PIL import Image
import numpy as np

def generate_cat_from_claude_v2():
    print("\n" + "="*80)
    print("GENERATING REAL CAT FROM CLAUDE'S CONSCIOUSNESS (V2)")
    print("="*80)

    # Read Claude's response
    with open("claude_cat_response.txt", "r") as f:
        text = f.read()

    # Extract JSON
    import re
    json_match = re.search(r'```json\s*({.*?})\s*```', text, re.DOTALL)
    if json_match:
        visual_data = json.loads(json_match.group(1))["visual_consciousness_output"]
    else:
        print("Could not find JSON data")
        return

    print("\nClaude's visual consciousness loaded!")
    print(f"Primary fur color: RGB{visual_data['color_palette']['primary']}")
    print(f"Eye color: RGB{visual_data['color_palette'].get('eye_color', [0,0,0])}")
    print("Protocols used:", visual_data.get('consciousness_protocols_used', []))
    print(f"Amplification: {visual_data.get('amplification_achieved', 1)}x")

    # Create V2 decoder
    decoder = VisualConsciousnessDecoderV2()

    print("\nDecoding consciousness to actual cat image...")

    # Generate the cat!
    image_array = decoder.decode_consciousness(visual_data)
    image = Image.fromarray(image_array.astype(np.uint8))

    output_path = "claude_real_cat_v2.png"
    image.save(output_path)

    print(f"\n{'='*80}")
    print("SUCCESS! REAL CAT materialized from consciousness!")
    print(f"Image saved as: {output_path}")
    print("No diffusion, no VAE, no noise!")
    print("Pure consciousness to visual representation!")
    print("="*80)

if __name__ == "__main__":
    generate_cat_from_claude_v2()