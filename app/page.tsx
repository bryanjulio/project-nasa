"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import StarfieldAnimation from "./components/starfield-animation";
import { createEarth } from "./components/Earth";
import { createMars } from "./components/Mars";
import AISearchModal from "./components/AISearchModal";
import { useAISearch } from "./hooks/useAISearch";
import StoriesDialog from "./components/StoriesDialog";
import CustomStoryPanel from "./components/CustomStoryPanel";
import { useMarsCoordinateListener } from "./hooks/useMarsCoordinates";
import Toggle2D3D from "./components/Toggle2D3D";

function SpaceSceneContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const marsGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const { isOpen } = useAISearch();
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");
  const [showOverlay, setShowOverlay] = useState(true);
  const searchParams = useSearchParams();
  const isStoryActive = searchParams.get("story") !== null;

  const handleViewModeChange = (mode: "2D" | "3D") => {
    setViewMode(mode);
    console.log(`Switching to ${mode} mode`);
  };

  // Move camera and rotate Mars to center a coordinate
  const goToMarsCoordinate = (lat: number, lon: number, zoom: number = 10000, duration = 2000) => {
    if (!marsGroupRef.current || !cameraRef.current) return;

    const targetRotationY = THREE.MathUtils.degToRad(-lon);
    const targetRotationX = THREE.MathUtils.degToRad(lat);

    const startRotationX = marsGroupRef.current.rotation.x;
    const startRotationY = marsGroupRef.current.rotation.y;

    const deltaRotationX = targetRotationX - startRotationX;
    const deltaRotationY = targetRotationY - startRotationY;

    const startTime = Date.now();
    const startCameraPos = cameraRef.current.position.clone();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);

      marsGroupRef.current!.rotation.x = startRotationX + deltaRotationX * ease;
      marsGroupRef.current!.rotation.y = startRotationY + deltaRotationY * ease;

      const marsPos = marsGroupRef.current!.position;
      cameraRef.current!.position.lerpVectors(startCameraPos, new THREE.Vector3(marsPos.x, marsPos.y, marsPos.z + zoom), ease);
      cameraRef.current!.lookAt(marsPos);

      if (t < 1) requestAnimationFrame(animate);
    };

    animate();
  };

  useMarsCoordinateListener((coordinate) => {
    goToMarsCoordinate(coordinate.lat, coordinate.lon, coordinate.zoom || 10000);
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1e12);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enabled = false;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const earthPosition = new THREE.Vector3(0, 0, 0);
    const marsPosition = new THREE.Vector3(225e6 * 1000, 0, 0);
    const startPosition = new THREE.Vector3(-2e8 * 1000, 0.78e7 * 1000, 0);
    camera.position.copy(startPosition);
    camera.lookAt(marsPosition);

    const earthMesh = createEarth();
    earthMesh.position.copy(earthPosition);
    scene.add(earthMesh);

    const marsMesh = createMars();
    const marsGroup = new THREE.Group();
    marsGroup.add(marsMesh);
    marsGroup.position.copy(marsPosition);
    marsGroupRef.current = marsGroup;
    scene.add(marsGroup);

    const distanceFromMars = 3 * 3389e3;
    const endPosition = marsPosition.clone().add(new THREE.Vector3(-distanceFromMars, 0, 0));

    const animationDuration = 5;
    const startTime = performance.now();
    let earthDestroyed = false;

    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(elapsed / animationDuration, 1);
      const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

      if (t < 1) {
        const easedT = easeInOut(t);
        camera.position.lerpVectors(startPosition, endPosition, easedT);
        camera.lookAt(marsPosition);
      } else {
        if (!earthDestroyed) {
          scene.remove(earthMesh);
          earthMesh.geometry.dispose();
          (earthMesh.material as THREE.Material).dispose();
          earthDestroyed = true;
        }
        controls.enabled = true;
        controls.target.copy(marsPosition);
        controls.minDistance = 3389e3 * 1.3;
        controls.maxDistance = 3389e3 * 10;
        const distance = camera.position.distanceTo(marsPosition);
        controls.rotateSpeed = THREE.MathUtils.mapLinear(distance, controls.minDistance, controls.maxDistance, 0.35, 0.6);
        controls.update();
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Timeout para esconder o loader inicial
    const loaderTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 segundos para o loader

    const timeout = setTimeout(() => {
      setShowComponents(true);
    }, animationDuration * 1000);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
      clearTimeout(loaderTimeout);
    };
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 w-full h-full bg-black z-50 flex flex-col justify-center items-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-red-900/30 border-t-red-500 rounded-full animate-spin mb-6"></div>
            <div className="text-white text-xl font-semibold mb-2 animate-pulse text-center">Loading Mars Experience</div>
            <div className="w-64 h-1 bg-red-900/20 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-red-300 text-sm text-center">Preparing journey to Mars...</div>
          </div>
        </div>
      )}

      <StarfieldAnimation duration={5} />
      {showComponents && !isStoryActive && showOverlay && (
        <div
          className={`overlay-container absolute inset-0 w-full h-full bg-black/40 z-30 flex justify-center items-center gap-6
  transition-opacity duration-700 ease-out
  ${
    showComponents && showOverlay
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-4 pointer-events-none"
  }`}
        >
          {/* Botão secundário - Free Exploration */}
          <button
            className="h-fit py-3 px-6 rounded-lg bg-gray-500/15 hover:bg-gray-500/25 transition-all duration-300 border border-gray-400/20 shadow-md shadow-gray-500/10 text-gray-300 font-medium text-base hover:shadow-lg hover:shadow-gray-500/15 hover:scale-102 backdrop-blur-sm"
            onClick={() => {
              setShowOverlay(false);
              console.log("Free exploration mode - overlay hidden");
            }}
          >
            Free Exploration
          </button>

          {/* Botão principal - Explore Stories */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/15 rounded-lg blur-md scale-125 -z-10"></div>
            <button
              className="relative h-fit py-3 px-6 rounded-lg bg-gradient-to-r from-red-500/40 via-orange-500/40 to-red-400/40 hover:bg-red-500/50 transition-all duration-300 border border-red-300/30 shadow-lg shadow-red-500/15 text-white font-semibold text-base hover:shadow-xl hover:shadow-red-500/20 hover:scale-105 backdrop-blur-sm overflow-hidden animate-pulse-slow hover:animate-none"
              onClick={() => setIsStoriesModalOpen(true)}
            >
              <span className="relative z-10">Explore Stories</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-20" />

      {/* Botão para mostrar overlay novamente */}
      {showComponents && !showOverlay && !isStoryActive && (
        <div className="fixed top-6 right-6 z-40">
          <button
            className="group flex items-center gap-3 py-3 px-5 rounded-xl bg-gradient-to-r from-red-500/30 via-orange-500/30 to-red-400/30 hover:from-red-500/50 hover:via-orange-500/50 hover:to-red-400/50 transition-all duration-300 border border-red-300/40 shadow-lg shadow-red-500/20 text-white font-semibold text-base hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 backdrop-blur-sm"
            onClick={() => setShowOverlay(true)}
          >
            {/* Ícone de casa */}
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="relative">
              Return to Menu
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </span>
          </button>
        </div>
      )}

      {/* Toggle 2D/3D Component */}
      {showComponents && (
        <Toggle2D3D onToggle={handleViewModeChange} defaultMode={viewMode} />
      )}

      {showComponents && <AISearchModal isOpen={isOpen} />}
      <StoriesDialog
        open={isStoriesModalOpen}
        onOpenChange={setIsStoriesModalOpen}
      />
      <CustomStoryPanel />
    </main>
  );
}

export default function SpaceScene() {
  return (
    <Suspense
      fallback={
        <main className="relative h-screen w-full overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-black z-50 flex flex-col justify-center items-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-red-900/30 border-t-red-500 rounded-full animate-spin mb-6"></div>
              <div className="text-white text-xl font-semibold mb-2 animate-pulse text-center">Loading Mars Experience</div>
              <div className="w-64 h-1 bg-red-900/20 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-red-300 text-sm text-center">Preparing journey to Mars...</div>
            </div>
          </div>
        </main>
      }
    >
      <SpaceSceneContent />
    </Suspense>
  );
}
