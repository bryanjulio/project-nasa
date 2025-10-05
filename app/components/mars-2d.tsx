"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const TILE_SIZE = 256;
const MAX_CACHE_SIZE = 500;
const PREFETCH_RADIUS = 2;
const MIN_ZOOM = 1;
const MAX_ZOOM = 7;

/**
 * Mars2D - Interactive 2D Mars surface viewer
 *
 * Features:
 * - Drag navigation with mouse
 * - Zoom levels 1-7 using scroll wheel
 * - Efficient tile caching (max 500 tiles)
 * - Auto-prefetch of nearby tiles
 * - Horizontal wrap-around (full planet navigation)
 * - Vertical clamping at poles
 *
 * Data source: NASA Trek API (Mars Viking MDIM 2.1 Color Mosaic)
 */
export default function MarsMap2D() {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [loadingTiles, setLoadingTiles] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const tilesCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const loadingQueue = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getMaxTiles = (zoomLevel: number) => {
    // Baseado nos exemplos da NASA Trek:
    // Zoom 1: 3 colunas × 2 linhas | Zoom 2: 4 colunas × 4 linhas
    const cols = zoomLevel + 2;
    const rows = Math.pow(2, zoomLevel);
    return { maxX: cols - 1, maxY: rows - 1 };
  };

  const loadTile = useCallback(
    (z: number, x: number, y: number): Promise<HTMLImageElement | null> => {
      const key = `${z}-${x}-${y}`;

      if (tilesCache.current.has(key)) {
        return Promise.resolve(tilesCache.current.get(key)!);
      }

      if (loadingQueue.current.has(key)) {
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (tilesCache.current.has(key)) {
              clearInterval(checkInterval);
              resolve(tilesCache.current.get(key)!);
            }
          }, 50);
        });
      }

      loadingQueue.current.add(key);

      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = `/api/mars-tile?zoom=${z}&x=${x}&y=${y}`;

        img.onload = () => {
          if (tilesCache.current.size > MAX_CACHE_SIZE) {
            const firstKey = tilesCache.current.keys().next().value;
            if (firstKey) {
              tilesCache.current.delete(firstKey);
            }
          }
          tilesCache.current.set(key, img);
          loadingQueue.current.delete(key);
          resolve(img);
        };

        img.onerror = () => {
          console.warn(`Falha ao carregar tile ${key}`);
          loadingQueue.current.delete(key);
          resolve(null);
        };
      });
    },
    []
  );

  const prefetchTiles = useCallback(
    (centerTileX: number, centerTileY: number, zoomLevel: number) => {
      const { maxX, maxY } = getMaxTiles(zoomLevel);
      const maxCols = maxX + 1;

      for (let dy = -PREFETCH_RADIUS; dy <= PREFETCH_RADIUS; dy++) {
        for (let dx = -PREFETCH_RADIUS; dx <= PREFETCH_RADIUS; dx++) {
          let tileX = centerTileX + dx;
          const tileY = centerTileY + dy;

          tileX = ((tileX % maxCols) + maxCols) % maxCols;

          if (tileY < 0 || tileY > maxY) continue;

          loadTile(zoomLevel, tileX, tileY).catch(() => {});
        }
      }
    },
    [loadTile]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const { maxX, maxY } = getMaxTiles(zoom);
    const maxCols = maxX + 1;
    const maxRows = maxY + 1;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let tilesX = Math.ceil(canvas.width / TILE_SIZE) + 1;
    let tilesY = Math.ceil(canvas.height / TILE_SIZE) + 1;
    tilesX = Math.min(tilesX, maxCols);
    tilesY = Math.min(tilesY, maxRows);

    const startTileX = Math.floor(-offsetXRef.current / TILE_SIZE);
    const startTileY = Math.floor(-offsetYRef.current / TILE_SIZE);
    const offsetInTileX = offsetXRef.current % TILE_SIZE;
    const offsetInTileY = offsetYRef.current % TILE_SIZE;

    const maxOffsetY = maxY * TILE_SIZE;
    if (offsetYRef.current < -maxOffsetY) offsetYRef.current = -maxOffsetY;
    if (offsetYRef.current > 0) offsetYRef.current = 0;

    let tilesToLoad = 0;
    const currentZoom = zoom;
    const drawnTiles = new Set<string>();

    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        let tileX = startTileX + tx;
        const tileY = startTileY + ty;

        if (tileY < 0 || tileY > maxY) continue;

        tileX = ((tileX % maxCols) + maxCols) % maxCols;

        const tileKey = `${tileX}-${tileY}`;
        if (drawnTiles.has(tileKey)) continue;
        drawnTiles.add(tileKey);

        const drawX = tx * TILE_SIZE + offsetInTileX;
        const drawY = ty * TILE_SIZE + offsetInTileY;

        tilesToLoad++;

        loadTile(currentZoom, tileX, tileY).then((img) => {
          // Verificar se ainda estamos no mesmo zoom antes de desenhar
          if (img && canvas.width > 0 && currentZoom === zoom) {
            ctx.drawImage(img, drawX, drawY, TILE_SIZE, TILE_SIZE);
          }
          setLoadingTiles((prev) => Math.max(0, prev - 1));
        });
      }
    }

    setLoadingTiles(tilesToLoad);
  }, [zoom, loadTile]);

  useEffect(() => {
    render();
  }, [render]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastPosRef.current = { x: offsetXRef.current, y: offsetYRef.current };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    offsetXRef.current = lastPosRef.current.x + dx;
    offsetYRef.current = lastPosRef.current.y + dy;

    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(() => {
        render();
        animationFrameRef.current = null;
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;

    // Pré-carregar tiles vizinhos após parar de arrastar
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    prefetchTimeoutRef.current = setTimeout(() => {
      const startTileX = Math.floor(-offsetXRef.current / TILE_SIZE);
      const startTileY = Math.floor(-offsetYRef.current / TILE_SIZE);
      const { maxX } = getMaxTiles(zoom);
      const maxCols = maxX + 1;
      const centerTileX = ((startTileX % maxCols) + maxCols) % maxCols;

      prefetchTiles(centerTileX, startTileY, zoom);
    }, 300); // Aguardar 300ms após parar de arrastar
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));

    if (newZoom !== zoom) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#0a0a0a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      setZoom(newZoom);
      const scale = Math.pow(2, delta);
      offsetXRef.current *= scale;
      offsetYRef.current *= scale;
    }
  };

  useEffect(() => {
    const handleResize = () => render();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [render]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "auto" }}
      />
      {loadingTiles > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-500/30">
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-sm">
              Carregando {loadingTiles} tiles...
            </span>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-red-500/30 pointer-events-none">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-mono text-sm">MARS SURFACE</span>
          </div>
          <div className="text-gray-300 text-sm">
            <p>
              Zoom Level: {zoom}/{MAX_ZOOM}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
