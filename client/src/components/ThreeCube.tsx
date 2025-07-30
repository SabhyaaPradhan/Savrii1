import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCubeProps {
  className?: string;
}

export default function ThreeCube({ className = '' }: ThreeCubeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    console.log('ThreeCube: Initializing Three.js cube...');

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8; // Move camera back to accommodate larger cube

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, // Enable transparency
      antialias: true // Smooth edges
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;
    
    containerRef.current.appendChild(renderer.domElement);

    // Create cube geometry - bigger size
    const geometry = new THREE.BoxGeometry(4, 4, 4);

    // Create a transparent emerald material for background
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x10b981, // emerald-500
      transparent: true,
      opacity: 0.3,
      shininess: 100
    });

    // Add ambient light for subtle illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light for shiny effects
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Create cube mesh
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, 0); // Center the cube
    scene.add(cube);

    // Add subtle wireframe for definition
    const wireframeGeometry = new THREE.EdgesGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x10b981, // emerald-500
      transparent: true,
      opacity: 0.5
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    cube.add(wireframe);
    
    console.log('ThreeCube: Cube and wireframe added to scene');
    console.log('ThreeCube: Starting animation...');

    // Animation function with performance optimization
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Rotate cube on both X and Y axes with smooth motion
      cube.rotation.x += 0.003;
      cube.rotation.y += 0.005;
      cube.rotation.z += 0.001;

      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Clean up Three.js objects
      geometry.dispose();
      material.dispose();
      wireframeMaterial.dispose();
      wireframeGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`three-cube-canvas ${className}`}
    />
  );
}