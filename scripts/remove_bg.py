import os
import glob
from rembg import remove
from PIL import Image

def process_image(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path)
        print(f"Saved to {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    artifact_dir = r"C:\Users\leroy\.gemini\antigravity\brain\c9b4742f-ba9a-401a-9b2d-93b261b0e285"
    
    # Process all pngs that start with iso_ but haven't been processed yet
    search_pattern = os.path.join(artifact_dir, "iso_*.png")
    
    for filename in glob.glob(search_pattern):
        # Skip already transparent-ized files
        if "_transparent.png" in filename:
            continue
            
        output_filename = filename.replace(".png", "_transparent.png")
        if not os.path.exists(output_filename):
            process_image(filename, output_filename)
        else:
            print(f"Skipping {filename}, transparent version already exists.")
