import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeSphere = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sphereRef = useRef<THREE.Mesh>();
  const innerSphereRef = useRef<THREE.Mesh>();

  useEffect(() => {
    if (!mountRef.current) return;

    console.log('ThreeSphere: Initializing Three.js sphere...');

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      1, // 1:1 aspect ratio for sphere
      0.1,
      1000
    );
    camera.position.z = 4;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(100, 100);
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;
    
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x34d399, 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x10b981, 0.8, 100);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(0x6ee7b7, 0.6, 100);
    rimLight.position.set(0, 0, -5);
    scene.add(rimLight);

    // Create main sphere geometry
    const sphereGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    
    // Create sphere material with realistic shading
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      shininess: 150,
      specular: 0x6ee7b7,
      transparent: true,
      opacity: 0.85
    });

    // Create main sphere mesh
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereRef.current = sphere;
    scene.add(sphere);

    // Create inner sphere for depth effect
    const innerSphereGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const innerSphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });

    const innerSphere = new THREE.Mesh(innerSphereGeometry, innerSphereMaterial);
    innerSphereRef.current = innerSphere;
    scene.add(innerSphere);

    // Create wireframe overlay for detail
    const wireframeGeometry = new THREE.SphereGeometry(1.25, 16, 16);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);

    console.log('ThreeSphere: Sphere and wireframe added to scene');

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      if (sphereRef.current && innerSphereRef.current) {
        // Rotate main sphere
        sphereRef.current.rotation.x += 0.005;
        sphereRef.current.rotation.y += 0.01;
        
        // Counter-rotate inner sphere for complex motion
        innerSphereRef.current.rotation.x -= 0.008;
        innerSphereRef.current.rotation.y -= 0.006;
        innerSphereRef.current.rotation.z += 0.003;
        
        // Add slight wobble
        sphereRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.1;
        sphereRef.current.position.x = Math.cos(Date.now() * 0.0015) * 0.05;
      }
      
      renderer.render(scene, camera);
    };

    animate();
    console.log('ThreeSphere: Starting animation...');

    // Handle window resize
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.setSize(100, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      
      console.log('ThreeSphere: Cleaned up');
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-[100px] h-[100px]"
      style={{ 
        filter: 'drop-shadow(0 4px 8px rgba(52, 211, 153, 0.4))'
      }}
    />
  );
};

export default ThreeSphere;