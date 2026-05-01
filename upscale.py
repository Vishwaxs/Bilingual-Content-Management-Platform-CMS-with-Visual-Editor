import cv2
import numpy as np
from PIL import Image

def process_flag():
    print("Loading image...")
    # Load largest reference
    img = cv2.imread('public/reference-flag.jpg')
    
    # Convert to HSV to separate background
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Saffron is highly saturated. White background is low saturation.
    # Create mask: Saturation > 30 and Value > 50
    s_channel = hsv[:, :, 1]
    v_channel = hsv[:, :, 2]
    
    # Threshold for the flag outline
    _, mask = cv2.threshold(s_channel, 30, 255, cv2.THRESH_BINARY)
    
    # Refine mask with morphological operations
    kernel = np.ones((5,5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    
    # Find largest contour (the flag)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    largest_contour = max(contours, key=cv2.contourArea)
    
    # Create a smooth alpha mask
    alpha = np.zeros(img.shape[:2], dtype=np.uint8)
    cv2.drawContours(alpha, [largest_contour], -1, 255, -1)
    
    # Anti-alias the edge
    alpha = cv2.GaussianBlur(alpha, (5, 5), 0)
    
    # Create RGBA image
    b, g, r = cv2.split(img)
    rgba = [b, g, r, alpha]
    dst = cv2.merge(rgba, 4)
    
    # Crop to bounding box
    x, y, w, h = cv2.boundingRect(largest_contour)
    # Add a little padding
    padding = 20
    x = max(0, x - padding)
    y = max(0, y - padding)
    w = min(img.shape[1] - x, w + 2*padding)
    h = min(img.shape[0] - y, h + 2*padding)
    cropped = dst[y:y+h, x:x+w]
    
    # Upscale 2x using Lanczos
    target_width = 1600
    scale = target_width / cropped.shape[1]
    target_height = int(cropped.shape[0] * scale)
    upscaled = cv2.resize(cropped, (target_width, target_height), interpolation=cv2.INTER_LANCZOS4)
    
    # Unsharp mask for realism and "upscaled quality"
    gaussian_3 = cv2.GaussianBlur(upscaled, (0, 0), 2.0)
    sharpened = cv2.addWeighted(upscaled, 1.5, gaussian_3, -0.5, 0)
    
    cv2.imwrite('public/abhm-flag-hq.png', sharpened)
    print("Saved HQ PNG")
    
    # Generate Favicons
    # Favicons need to be square.
    # Take a square crop of the swastika/Om area, or just pad the flag to square.
    sq_size = max(target_width, target_height)
    square = np.zeros((sq_size, sq_size, 4), dtype=np.uint8)
    x_off = (sq_size - target_width) // 2
    y_off = (sq_size - target_height) // 2
    square[y_off:y_off+target_height, x_off:x_off+target_width] = sharpened
    
    # Convert OpenCV BGRA to PIL RGBA
    square_rgb = cv2.cvtColor(square, cv2.COLOR_BGRA2RGBA)
    pil_img = Image.fromarray(square_rgb)
    
    # Save standard favicons
    pil_img.resize((192, 192), Image.Resampling.LANCZOS).save('public/favicon.svg', format='PNG')
    pil_img.resize((32, 32), Image.Resampling.LANCZOS).save('public/favicon.ico')
    print("Saved Favicons")

process_flag()
