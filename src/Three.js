import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useEffect, useRef } from "react";

function MyThree() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Store ref in variable for cleanup
    const container = containerRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const BASE_FOV = 50; // degrees - matches original framing on wide/landscape viewports
    const BASE_HORIZONTAL_TAN = Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2));
    const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 10000);

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0xe5e5e5, 1); // Light grey background

    // Size against the container's own box (not the full window) so the
    // render isn't taller than the space it's actually shown in, which was
    // pushing the scene off-center. Also widen the vertical FOV on
    // narrow/portrait containers so the horizontal field of view (and
    // therefore the wheels' width) stays consistent instead of cropping.
    const updateCameraAndSize = () => {
      const width = container ? container.clientWidth : window.innerWidth;
      const height = container ? container.clientHeight : window.innerHeight;
      const aspect = width / height;
      camera.aspect = aspect;
      camera.fov = aspect >= 1
        ? BASE_FOV
        : THREE.MathUtils.radToDeg(2 * Math.atan(BASE_HORIZONTAL_TAN / aspect));
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    updateCameraAndSize();
    
    // Add renderer to container
    if (container) {
      container.appendChild(renderer.domElement);
    }
    
    // Add lighting - increased brightness for textures
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Add additional light from opposite side for better illumination
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(-5, 3, -5);
    scene.add(directionalLight2);
    
    // Array to store wheel groups
    const wheelGroups = [];
    
    // Load GLTF model
    const loader = new GLTFLoader();
    
    loader.load(
      '/models/scene.gltf',
      (gltf) => {
        const originalModel = gltf.scene;
        
        // Get bounding box
        const box = new THREE.Box3().setFromObject(originalModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        console.log('Model size:', size);
        
        // Create 8 wheels in a 2x4 grid
        const spacing = 1500;
        
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 4; j++) {
            // Clone the model
            const clonedModel = originalModel.clone();
            
            // Center the model
            clonedModel.translateX(-center.x);
            clonedModel.translateY(-center.y);
            clonedModel.translateZ(-center.z);
            
            // Create a group for this wheel
            const wheelGroup = new THREE.Group();
            wheelGroup.scale.set(4, 4, 4);
            wheelGroup.rotation.y = 0.5;
            wheelGroup.rotation.x = 0.5;
            
            // Add cloned model to group
            wheelGroup.add(clonedModel);
            
            // Position in 2x4 grid (center them around origin)
            const offsetX = (i - 0.5) * spacing;
            const offsetZ = (j - 1.5) * spacing;
            wheelGroup.position.set(offsetX, 0, offsetZ);
            
            scene.add(wheelGroup);
            wheelGroups.push(wheelGroup);
          }
        }
        
        // Position camera to view all wheels - brought closer
        const diagonalSize = Math.sqrt(size.x ** 2 + size.y ** 2 + size.z ** 2);
        const safeDistance = diagonalSize * 2.3 * 4; // Reduced multiplier to bring camera closer
        camera.position.set(0, 0, safeDistance * 0.8); // Straight-on, no vertical tilt, so the wheels sit centered in frame
        const isPortrait = container ? container.clientWidth < container.clientHeight : window.innerWidth < window.innerHeight;
        // Mobile: nudge view right a bit. Desktop: keep the original centered framing.
        const horizontalLookAt = isPortrait ? -safeDistance * 0.011 : 0;
        camera.lookAt(horizontalLookAt, 0, 0);
        
      }
    );
    
    // Handle window resize
    const handleResize = () => {
      updateCameraAndSize();
    };
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let frameCount = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      frameCount++;
      
      // Animate all wheels
      wheelGroups.forEach((wheelGroup, index) => {
        wheelGroup.rotation.z -= 0.08;
        
        // Jump animation - add slight offset for variety
        const jumpHeight = 120;
        const t = ((frameCount + index * 30) % 90) / 90; // Offset each wheel
        const quickJump = Math.sin(Math.PI * t);
        const snappedJump = Math.pow(Math.abs(quickJump), 1/2) * (quickJump > 0 ? 1 : -1);
        wheelGroup.position.y = snappedJump * jumpHeight;
      });
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  return <div ref={containerRef} style={{ width: '100%', height: '90vh' }}></div>;
}

export default MyThree