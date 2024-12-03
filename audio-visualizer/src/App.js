import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader, EquirectangularReflectionMapping } from "three";
import { MeshDistortMaterial, OrbitControls, Environment } from "@react-three/drei";
import "./App.css";

const MetallicBlob = ({ texturePath, distort = 0.5, speed = 2, audioData }) => {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (meshRef.current) {
      const intensity = audioData ? Math.pow(audioData / 255, 2) * 3 : 0;
      const distortion = distort + intensity * 1;
      meshRef.current.position.y = Math.sin(time) * 0.1 + intensity * 0.2;
      const scale = 1 + intensity;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.y += 0.01 + intensity * 0.1;
      meshRef.current.material.distort = distortion;
    }
  });

  const texture = useLoader(TextureLoader, texturePath);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 128, 128]} />
      <MeshDistortMaterial
        map={texture}
        distort={distort}
        speed={speed}
        roughness={0.05}
        metalness={1}
        envMapIntensity={2}
        clearcoat={1}
        clearcoatRoughness={0}
      />
    </mesh>
  );
};

const Typewriter = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 100); // Typing speed
      return () => clearTimeout(timeout);
    }
  }, [text, index]);

  return (
    <span className="typewriter-text">
      {displayText}
      {index < text.length && <span className="cursor">|</span>}
    </span>
  );
};

const App = () => {
  const [audioData, setAudioData] = useState(0);
  const analyserRef = useRef(null);

  const handleRecord = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyserRef.current = { analyser, dataArray };

      const captureAudio = () => {
        if (analyserRef.current) {
          analyserRef.current.analyser.getByteFrequencyData(analyserRef.current.dataArray);
          const avg = analyserRef.current.dataArray.reduce((a, b) => a + b) / analyserRef.current.dataArray.length;
          setAudioData(avg);
          requestAnimationFrame(captureAudio);
        }
      };
      captureAudio();
    });
  };

  const environmentTexture = useLoader(TextureLoader, "textures/blue2.avif");
  environmentTexture.mapping = EquirectangularReflectionMapping;

  return (
    <div className="container">
      {/* Top Bar */}
      <div className="top-bar">
        <Typewriter text="Welcome to Sotify: your voice, your emotions, perfectly cloned" />
      </div>

      {/* Canvas with Metallic Blob */}
      <Canvas>
        <ambientLight intensity={0.1} />
        <Environment background={false} map={environmentTexture} />
        <MetallicBlob
          texturePath="textures/blue2.avif"
          distort={0.5}
          speed={2}
          audioData={audioData}
        />
        <OrbitControls />
      </Canvas>

      {/* Interactive Button */}
      <div className="button-overlay" onClick={handleRecord}>
        <span>TRY </span>
        <span>SOTIFY </span>
        <span>NOW </span>
      </div>

      {/* Circular Frame */}
      <div className="circular-frame"></div>

      {/* Bottom Bar */}
      <div className="bottom-bar">
        <Typewriter text="مرحبًا بكم في Sotify: صوتك، مشاعرك، مستنسخة بشكل مثالي" />
      </div>
    </div>
  );
};

export default App;
