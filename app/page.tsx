"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TilesRenderer, GlobeControls } from "3d-tiles-renderer";
import { CesiumIonAuthPlugin } from "3d-tiles-renderer/plugins";
import MarsStorySheet from "./components/MarsStorySheet";
import { useMarsCoordinateListener } from "./hooks/useMarsCoordinates";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<GlobeControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Função para converter coordenadas lat/lon para posição 3D
  const latLonToPosition = (
    lat: number,
    lon: number,
    radius: number = 3390000
  ) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // Listener para mudanças de coordenadas
  useMarsCoordinateListener((coordinate) => {
    if (controlsRef.current && cameraRef.current) {
      const position = latLonToPosition(
        coordinate.lat,
        coordinate.lon,
        coordinate.zoom || 1000000
      );

      // Animar para a nova posição
      const startPosition = cameraRef.current.position.clone();
      const startTime = Date.now();
      const duration = 2000; // 2 segundos

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        cameraRef.current!.position.lerpVectors(
          startPosition,
          position,
          easeProgress
        );
        controlsRef.current!.update();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  });

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
    cameraRef.current = camera;

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
    controlsRef.current = controls;

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
      controlsRef.current = null;
      cameraRef.current = null;
    };
  }, []);

  return (
    <div className="w-screen h-screen">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <MarsStorySheet />
    </div>
  );
}
