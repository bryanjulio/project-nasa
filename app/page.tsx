"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TilesRenderer, GlobeControls } from "3d-tiles-renderer";
import { CesiumIonAuthPlugin } from "3d-tiles-renderer/plugins";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Cena
    const scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Câmera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1e8
    );
    camera.position.set(0, 0, 10000000);
    camera.lookAt(0, 0, 0);

    // Tiles do Cesium Ion (Marte)
    const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
    const assetId = 3644333; // Cesium Mars
    const tilesRenderer = new TilesRenderer();
    tilesRenderer.registerPlugin(
      new CesiumIonAuthPlugin({
        apiToken: ionToken!,
        assetId: assetId.toString(),
      })
    );
    tilesRenderer.group.rotation.x = -Math.PI / 2; // polo norte "para cima"
    scene.add(tilesRenderer.group);
    tilesRenderer.setCamera(camera);

    // Controles
    const controls = new GlobeControls(
      scene,
      camera,
      renderer.domElement,
      tilesRenderer
    );
    controls.enableDamping = true;
    controls.minDistance = 1000;

    // Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      tilesRenderer.setResolutionFromRenderer(camera, renderer);
      camera.updateMatrixWorld();
      tilesRenderer.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      tilesRenderer.dispose();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-screen h-screen">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
