# 3D Models Directory

Place your GLTF model files here.

## How to add your Sketchfab model:

1. Download the GLTF format from Sketchfab:
   - Go to your model on Sketchfab
   - Click the download button
   - Select "GLTF" format
   - Download all files (the .gltf file and any referenced textures)

2. Place the files in this directory:
   - If there's a .gltf file and a textures folder, put both here
   - Make sure the directory structure is preserved

3. Update the path in `src/Three.js` (line 42) to match your model filename

## File structure example:
```
public/
  models/
    your-model.gltf
    your-model.bin (if present)
    textures/
      - texture1.jpg
      - texture2.png
```


