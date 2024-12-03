import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const HolographicBlob = ({ audioData }) => {
  const meshRef = useRef();

  // Animate the blob based on audio data
  useFrame(() => {
    if (meshRef.current && audioData) {
      const scale = 1 + audioData.reduce((a, b) => a + b, 0) / 1000;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <MeshDistortMaterial
        distort={0.6}
        speed={2}
        color="#9bd4f7"
        roughness={0.2}
        metalness={0.9}
        emissive="#d3eaf7"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

const BlobCanvas = ({ audioData }) => (
  <Canvas>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} />
    <HolographicBlob audioData={audioData} />
  </Canvas>
);

export default BlobCanvas;
