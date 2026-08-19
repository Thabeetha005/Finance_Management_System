import sys
from rembg import remove
from PIL import Image

input_path = "C:/Users/thabe/.gemini/antigravity/brain/03ab3694-b41f-4c9f-8798-78922552b657/.user_uploaded/media_1787030355217.png"
output_path = "frontend/public/kalpanaa-logo-new.png"

print("Opening image...")
with open(input_path, 'rb') as i:
    with open(output_path, 'wb') as o:
        input_data = i.read()
        print("Removing background...")
        output_data = remove(input_data)
        o.write(output_data)
        print("Done!")
