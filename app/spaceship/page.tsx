"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import StarfieldAnimation from "../components/starfield-animation";

export default function SpaceScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("black");

    scene.background = null; // deixa a cena sem fundo, para o canvas ser transparente

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0); // fundo transparente

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Câmera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1e12
    );

    // PLANETAS: posições reais simplificadas
    const earthPosition = new THREE.Vector3(0, 0, 0); // origem
    const marsPosition = new THREE.Vector3(225e6 * 1000, 0, 0); // 225 milhões de km adiante

    // Câmera começa atrás da Terra
    const startPosition = new THREE.Vector3(-5e7 * 1000, 1e7 * 1000, 0); // 20 milhões de km acima

    camera.position.copy(startPosition);
    camera.lookAt(marsPosition); // Olha para Marte desde o início

    // Representação simples da Terra
    const earthGeometry = new THREE.SphereGeometry(6371e3 * 500, 64, 64); // 500x escala
    const earthMaterial = new THREE.MeshBasicMaterial({ color: "blue" });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthMesh.position.copy(earthPosition);
    scene.add(earthMesh);

    // Representação simples de Marte
    const marsGeometry = new THREE.SphereGeometry(3389e3, 64, 64); // escala real

    const marsMaterial = new THREE.MeshBasicMaterial({ color: "red" });
    const marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);
    marsMesh.position.copy(marsPosition);
    scene.add(marsMesh);

    const distanceFromMars = 5 * 3389e3; // 5x o raio
    const endPosition = marsPosition
      .clone()
      .add(new THREE.Vector3(-distanceFromMars, 0, 0));

    // Animação
    const animationDuration = 5; // segundos
    const startTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(elapsed / animationDuration, 1);
      const easeInOut = (t: number) =>
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      const easedT = easeInOut(t);

      camera.position.lerpVectors(startPosition, endPosition, easedT);

      camera.lookAt(marsPosition); // Sempre olhar para Marte

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <StarfieldAnimation duration={5} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />
    </main>
  );
}
