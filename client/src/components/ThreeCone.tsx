import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeCone = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const coneRef = useRef<THREE.Mesh>();

  useEffect(() => {
    if (!mountRef.current) return;

    console.log('ThreeCone: Initializing Three.js cone...');

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      120 / 140, // width/height ratio for cone container
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(120, 140);
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;
    
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x10b981, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x34d399, 0.8, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Create cone geometry
    const coneGeometry = new THREE.ConeGeometry(1.2, 2.5, 8);
    
    // Create cone material with gradient-like effect
    const coneMaterial = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      shininess: 100,
      specular: 0x34d399,
      transparent: true,
      opacity: 0.8
    });

    // Create cone mesh
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.y = 0.2;
    coneRef.current = cone;
    scene.add(cone);

    // Create cone base (cylinder)
    const baseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 8);
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: 0x047857,
      transparent: true,
      opacity: 0.9
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1.05;
    scene.add(base);

    console.log('ThreeCone: Cone and base added to scene');

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      if (coneRef.current) {
        // Rotate cone with varying speed
        coneRef.current.rotation.y += 0.01;
        coneRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
        coneRef.current.rotation.z = Math.cos(Date.now() * 0.0015) * 0.05;
      }
      
      renderer.render(scene, camera);
    };

    animate();
    console.log('ThreeCone: Starting animation...');

    // Handle window resize
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.setSize(120, 140);
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
      
      console.log('ThreeCone: Cleaned up');
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-[120px] h-[140px]"
      style={{ 
        filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))'
      }}
    />
  );
};

export default ThreeCone;