"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useTileLoader, type LayerConfig } from "./useTileLoader";
import {
  TILE_SIZE,
  MIN_ZOOM,
  MAX_ZOOM,
  getTileGrid,
  normalizeCol,
  isValidRow,
} from "./utils";
import { Layers } from "lucide-react";

// Camadas disponíveis
const AVAILABLE_LAYERS: Record<
  string,
  LayerConfig & { name: string; description: string }
> = {
  viking_color: {
    name: "Viking Color",
    description: "Mars Viking Color Mosaic (232m/pixel)",
    endpoint: "Mars_Viking_MDIM21_ClrMosaic_global_232m",
    tileMatrixSet: "default028mm",
    format: "jpg",
    style: "default",
  },
  viking_gray: {
    name: "Viking Grayscale",
    description: "Mars Viking Grayscale Mosaic (232m/pixel)",
    endpoint: "Mars_Viking_MDIM21_Mosaic_global_232m",
    tileMatrixSet: "default028mm",
    format: "jpg",
    style: "default",
  },
  mola_color: {
    name: "MOLA Color Relief",
    description: "Mars Orbiter Laser Altimeter - Color (463m/pixel)",
    endpoint: "Mars_MGS_MOLA_ClrShade_merge_global_463m",
    tileMatrixSet: "default028mm",
    format: "png",
    style: "default",
  },
  themis_day: {
    name: "THEMIS Daytime IR",
    description: "Thermal Emission Imaging System - Day (100m/pixel)",
    endpoint: "Mars_MO_THEMIS_Day_IR_global_100m",
    tileMatrixSet: "default028mm",
    format: "png",
    style: "default",
  },
};

/**
 * Componente principal do mapa 2D de Marte
 * Usa NASA Trek WMTS API com suporte a múltiplas camadas
 */
export default function MarsMap2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [currentLayerId, setCurrentLayerId] = useState("viking_color");
  const [showLayerSelector, setShowLayerSelector] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const currentLayer = AVAILABLE_LAYERS[currentLayerId];
  const { loadTile, loadingCount, cacheSize, cancelAll } =
    useTileLoader(currentLayer);

  /**
   * Centralizar mapa ao iniciar
   */
  useEffect(() => {
    if (!isInitialized && canvasSize.width > 0 && canvasSize.height > 0) {
      // Começar sempre centralizado
      setOffset({ x: 0, y: 0 });
      setIsInitialized(true);
    }
  }, [isInitialized, canvasSize, zoom]);

  /**
   * Troca de camada
   */
  const switchLayer = useCallback(
    (layerId: string) => {
      cancelAll();
      setCurrentLayerId(layerId);
      setShowLayerSelector(false);
    },
    [cancelAll]
  );

  /**
   * Renderiza os tiles no canvas
   */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    // Atualizar tamanho do canvas se mudou
    if (rect.width !== canvasSize.width || rect.height !== canvasSize.height) {
      setCanvasSize({ width: rect.width, height: rect.height });
    }

    // Ajustar para high DPI displays
    const dpr = window.devicePixelRatio || 1;
    if (
      canvas.width !== rect.width * dpr ||
      canvas.height !== rect.height * dpr
    ) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    } // Limpar canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, rect.width, rect.height);
    const { cols, rows } = getTileGrid(zoom);

    // Tamanho total do mapa em pixels
    const mapWidth = cols * TILE_SIZE;
    const mapHeight = rows * TILE_SIZE;

    // Calcular posição inicial: centralizar o mapa no canvas
    const startX = (rect.width - mapWidth) / 2 + offset.x;
    const startY = (rect.height - mapHeight) / 2 + offset.y;

    // Renderizar TODOS os tiles do grid
    const tilesToLoad: Array<{
      col: number;
      row: number;
      x: number;
      y: number;
    }> = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const drawX = Math.floor(startX + col * TILE_SIZE);
        const drawY = Math.floor(startY + row * TILE_SIZE);
        tilesToLoad.push({ col, row, x: drawX, y: drawY });
      }
    }

    // Carregar e renderizar tiles
    tilesToLoad.forEach(async (tile) => {
      const img = await loadTile(zoom, tile.col, tile.row);
      if (img && canvasRef.current) {
        const currentCtx = canvasRef.current.getContext("2d", { alpha: false });
        if (currentCtx) {
          currentCtx.drawImage(img, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
        }
      }
    });
  }, [zoom, offset, loadTile, canvasSize]);

  /**
   * Re-renderizar quando necessário
   */
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      render();
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  /**
   * Aumenta o zoom
   */ const zoomIn = useCallback(() => {
    if (zoom < MAX_ZOOM) {
      setZoom((z) => z + 1);
      setOffset((prev) => ({
        x: prev.x * 2,
        y: prev.y * 2,
      }));
    }
  }, [zoom]);

  /**
   * Diminui o zoom
   */ const zoomOut = useCallback(() => {
    if (zoom > MIN_ZOOM) {
      setZoom((z) => z - 1);
      setOffset((prev) => ({
        x: prev.x / 2,
        y: prev.y / 2,
      }));
    }
  }, [zoom]);

  /**
   * Handlers de mouse
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      dragOffsetRef.current = { ...offset };
    },
    [offset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const newOffset = {
        x: dragOffsetRef.current.x + dx,
        y: dragOffsetRef.current.y + dy,
      };

      setOffset(newOffset);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const grid = getTileGrid(zoom);

  return (
    <div className="relative w-full h-full bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ width: "100%", height: "100%" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Seletor de Camadas */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setShowLayerSelector(!showLayerSelector)}
          className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-500/30 hover:border-red-500/60 transition-colors shadow-lg flex items-center gap-2"
        >
          <Layers className="w-4 h-4 text-red-400" />
          <span className="text-red-400 font-mono text-sm">
            {currentLayer.name}
          </span>
        </button>

        {showLayerSelector && (
          <div className="mt-2 bg-black/90 backdrop-blur-sm rounded-lg border border-red-500/30 shadow-lg overflow-hidden">
            {Object.entries(AVAILABLE_LAYERS).map(([id, layer]) => (
              <button
                key={id}
                onClick={() => switchLayer(id)}
                className={`w-full px-4 py-3 text-left hover:bg-red-500/10 transition-colors border-b border-red-500/10 last:border-b-0 ${
                  id === currentLayerId ? "bg-red-500/20" : ""
                }`}
              >
                <div className="text-sm font-medium text-red-400">
                  {layer.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {layer.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controles de Zoom */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="w-12 h-12 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-2xl font-bold rounded-lg transition-colors shadow-lg"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="w-12 h-12 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-2xl font-bold rounded-lg transition-colors shadow-lg"
          aria-label="Zoom out"
        >
          −
        </button>
      </div>

      {/* Info HUD */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-red-500/30 pointer-events-none shadow-lg z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-400 font-mono text-sm">NASA TREK WMTS</span>
        </div>
        <div className="text-gray-300 text-xs space-y-1">
          <p>
            Zoom: {zoom}/{MAX_ZOOM}
          </p>
          <p>
            Grid: {grid.cols}×{grid.rows} tiles
          </p>
          <p>Cache: {cacheSize} tiles</p>
          {loadingCount > 0 && (
            <p className="text-yellow-400">Loading: {loadingCount}</p>
          )}
        </div>
      </div>

      {/* Instruções */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-6 py-2 border border-red-500/30 shadow-lg z-10">
        <p className="text-gray-400 text-sm">
          <span className="text-red-400">Drag:</span> Pan map •
          <span className="text-red-400"> +/-:</span> Zoom
        </p>
      </div>
    </div>
  );
}
