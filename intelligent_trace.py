import cv2
import numpy as np

def trace_image(image_path, output_svg='public/abhm-flag.svg'):
    print(f"Loading {image_path}...")
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print("Image not found!")
        return

    # If it's pure RGB, handle it. If RGBA, we can discard alpha.
    if img.shape[2] == 4:
        img_bgr = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
    else:
        img_bgr = img

    h, w = img_bgr.shape[:2]

    # Convert to HSV to intelligently separate orange background from black logo
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    v_channel = hsv[:, :, 2]
    
    # Apply adaptive thresholding to find dark ink (the emblem)
    # Block size needs to be large to handle lighting gradients
    thresh = cv2.adaptiveThreshold(v_channel, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 99, 15)

    # We also know the emblem is in the center, and we want to ignore the edges of the flag
    # Let's clean the mask using morphological operations
    kernel = np.ones((3,3), np.uint8)
    # Remove small white dots
    clean_mask = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    # Fill small holes in the emblem
    clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, np.ones((5,5), np.uint8), iterations=2)

    # Find contours for the emblem
    contours, hierarchy = cv2.findContours(clean_mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    print(f"Found {len(contours)} contours.")

    # We will generate an SVG.
    # We create paths. We must handle holes in polygons using SVG filling rules (evenodd or finding hierarchy).
    # SVG fill-rule="evenodd" is perfect for hierarchies if we just dump all major contours.
    
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">
    <rect width="{w}" height="{h}" fill="#FF671F" />
    <g fill="#000000" fill-rule="evenodd">
'''

    # Filter contours based on area to avoid dust
    min_area = (h * w) * 0.0001
    
    # Instead of nested paths, we can define one big compound path for evenodd filling.
    path_d = ""
    for idx, cnt in enumerate(contours):
        area = cv2.contourArea(cnt)
        if area > min_area:
            # Smooth the contour drastically to make it look like a vector, not a pixelated mask
            epsilon = 0.001 * cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, epsilon, True)
            
            # Format the SVG path
            path_d += f"M {approx[0][0][0]},{approx[0][0][1]} "
            for pt in approx[1:]:
                path_d += f"L {pt[0][0]},{pt[0][1]} "
            path_d += "Z "

    svg_content += f'<path d="{path_d}" />\n'
    svg_content += '''    </g>
</svg>'''

    with open(output_svg, 'w') as f:
        f.write(svg_content)
    print(f"Saved highly accurate traced SVG at {output_svg}")

# Use the upscaled version as the user requested
trace_image('public/abhm-flag-hq.png')
