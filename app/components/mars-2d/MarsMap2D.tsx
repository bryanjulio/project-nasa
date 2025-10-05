"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { useTileLoader, type LayerConfig } from "./useTileLoader";
import { TILE_SIZE, MIN_ZOOM, MAX_ZOOM, getTileGrid } from "./utils";
import { latLonToPixel, pixelToLatLon } from "./coordinateUtils";
import { drawLocationPin } from "./pinRenderer";
import { Layers } from "lucide-react";

interface MarsMap2DProps {
  latitude?: number;
  longitude?: number;
}

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
  // viking_gray: {
  //   name: "Viking Grayscale",
  //   description: "Mars Viking Grayscale Mosaic (232m/pixel)",
  //   endpoint: "Mars_Viking_MDIM21_Mosaic_global_232m",
  //   tileMatrixSet: "default028mm",
  //   format: "jpg",
  //   style: "default",
  // },
  // mola_color: {
  //   name: "MOLA Color Relief",
  //   description: "Mars Orbiter Laser Altimeter - Color (463m/pixel)",
  //   endpoint: "Mars_MGS_MOLA_ClrShade_merge_global_463m",
  //   tileMatrixSet: "default028mm",
  //   format: "png",
  //   style: "default",
  // },
  // themis_day: {
  //   name: "THEMIS Daytime IR",
  //   description: "Thermal Emission Imaging System - Day (100m/pixel)",
  //   endpoint: "Mars_MO_THEMIS_Day_IR_global_100m",
  //   tileMatrixSet: "default028mm",
  //   format: "png",
  //   style: "default",
  // },
};

/**
 * Componente principal do mapa 2D de Marte
 * Usa NASA Trek WMTS API com suporte a múltiplas camadas
 */
export default function MarsMap2D({
  latitude,
  longitude,
}: MarsMap2DProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [currentLayerId, setCurrentLayerId] = useState("viking_color");
  const [showLayerSelector, setShowLayerSelector] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mouseLatLon, setMouseLatLon] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const currentLayer = AVAILABLE_LAYERS[currentLayerId];
  const { loadTile, loadingCount, cacheSize, cancelAll } =
    useTileLoader(currentLayer);

  // Memoize grid and map dimensions to avoid recalculating on every render
  const mapDimensions = useMemo(() => {
    const { cols, rows } = getTileGrid(zoom);
    return {
      cols,
      rows,
      mapWidth: cols * TILE_SIZE,
      mapHeight: rows * TILE_SIZE,
    };
  }, [zoom]);

  /**
   * Centralizar mapa ao iniciar ou quando lat/lon mudam
   */ useEffect(() => {
    if (!isInitialized && canvasSize.width > 0 && canvasSize.height > 0) {
      if (latitude !== undefined && longitude !== undefined) {
        // Se lat/lon foram fornecidos, centralizar nessa posição
        const { mapWidth, mapHeight } = mapDimensions;
        const pinPos = latLonToPixel(latitude, longitude, zoom);

        // Calcular offset para centralizar o pin na tela
        const offsetX =
          canvasSize.width / 2 - pinPos.x - (canvasSize.width - mapWidth) / 2;
        const offsetY =
          canvasSize.height / 2 -
          pinPos.y -
          (canvasSize.height - mapHeight) / 2;

        setOffset({ x: offsetX, y: offsetY });
      } else {
        // Começar centralizado no mapa
        setOffset({ x: 0, y: 0 });
      }
      setIsInitialized(true);
    }
  }, [isInitialized, canvasSize, zoom, latitude, longitude, mapDimensions]);

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
    } // Limpar canvas    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Usar dimensões memoizadas
    const { cols, rows, mapWidth, mapHeight } = mapDimensions;

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
    } // Função para desenhar o pin
    const drawPin = () => {
      if (
        latitude === undefined ||
        longitude === undefined ||
        !canvasRef.current
      )
        return;

      const canvas = canvasRef.current;
      const pinCtx = canvas.getContext("2d", { alpha: false });
      if (!pinCtx) return;

      const pinPos = latLonToPixel(latitude, longitude, zoom);
      const pinScreenX = startX + pinPos.x;
      const pinScreenY = startY + pinPos.y;

      drawLocationPin(pinCtx, pinScreenX, pinScreenY);
    };

    // Carregar e renderizar tiles
    tilesToLoad.forEach(async (tile) => {
      const img = await loadTile(zoom, tile.col, tile.row);
      if (img && canvasRef.current) {
        const currentCtx = canvasRef.current.getContext("2d", { alpha: false });
        if (currentCtx) {
          currentCtx.drawImage(img, tile.x, tile.y, TILE_SIZE, TILE_SIZE);

          // Redesenhar o pin após cada tile para mantê-lo sempre no topo
          drawPin();
        }
      }
    }); // Desenhar pin inicialmente (antes dos tiles carregarem)
    drawPin();
  }, [zoom, offset, loadTile, canvasSize, latitude, longitude, mapDimensions]);

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
   * Zoom focado no ponto do mouse
   */
  const zoomAtPoint = useCallback(
    (mouseX: number, mouseY: number, zoomDelta: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + zoomDelta));

      if (newZoom === zoom) return; // Não mudou o zoom

      // Posição do mouse relativa ao canvas
      const canvasMouseX = mouseX - rect.left;
      const canvasMouseY = mouseY - rect.top;

      // Calcular o ponto no mapa antes do zoom
      const { cols: oldCols, rows: oldRows } = getTileGrid(zoom);
      const oldMapWidth = oldCols * TILE_SIZE;
      const oldMapHeight = oldRows * TILE_SIZE;
      const oldStartX = (rect.width - oldMapWidth) / 2 + offset.x;
      const oldStartY = (rect.height - oldMapHeight) / 2 + offset.y;
      const mapPointX = canvasMouseX - oldStartX;
      const mapPointY = canvasMouseY - oldStartY;

      // Calcular escala
      const scale = Math.pow(2, newZoom - zoom);

      // Novo offset para manter o ponto do mouse fixo
      const { cols: newCols, rows: newRows } = getTileGrid(newZoom);
      const newMapWidth = newCols * TILE_SIZE;
      const newMapHeight = newRows * TILE_SIZE;
      const newStartX = (rect.width - newMapWidth) / 2;
      const newStartY = (rect.height - newMapHeight) / 2;

      // Calcular novo offset
      const newMapPointX = mapPointX * scale;
      const newMapPointY = mapPointY * scale;
      const newOffsetX = canvasMouseX - newStartX - newMapPointX;
      const newOffsetY = canvasMouseY - newStartY - newMapPointY;
      setZoom(newZoom);
      setOffset({ x: newOffsetX, y: newOffsetY });
    },
    [zoom, offset]
  );

  /**
   * Aumenta o zoom (botão)
   */
  const zoomIn = useCallback(() => {
    if (zoom < MAX_ZOOM && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      // Zoom no centro da tela
      zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 1);
    }
  }, [zoom, zoomAtPoint]);

  /**
   * Diminui o zoom (botão)
   */
  const zoomOut = useCallback(() => {
    if (zoom > MIN_ZOOM && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      // Zoom no centro da tela
      zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, -1);
    }
  }, [zoom, zoomAtPoint]);

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
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calcular posição do mouse no mapa
      const { mapWidth, mapHeight } = mapDimensions;
      const startX = (rect.width - mapWidth) / 2 + offset.x;
      const startY = (rect.height - mapHeight) / 2 + offset.y;

      const mapX = mouseX - startX;
      const mapY = mouseY - startY;

      // Verificar se o mouse está dentro do mapa
      if (mapX >= 0 && mapX < mapWidth && mapY >= 0 && mapY < mapHeight) {
        const coords = pixelToLatLon(mapX, mapY, zoom);
        setMouseLatLon(coords);
      } else {
        setMouseLatLon(null);
      }

      // Arrastar mapa
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const newOffset = {
          x: dragOffsetRef.current.x + dx,
          y: dragOffsetRef.current.y + dy,
        };
        setOffset(newOffset);
      }
    },
    [isDragging, zoom, offset, mapDimensions]
  );
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handler de scroll do mouse para zoom
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY > 0 ? -1 : 1;
      zoomAtPoint(e.clientX, e.clientY, zoomDelta);
    },
    [zoomAtPoint]
  );

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
        onWheel={handleWheel}
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
      </div>{" "}
      {/* Display de Coordenadas */}
      {mouseLatLon && (
        <div className="absolute top-4 right-20 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-500/30 shadow-lg z-10">
          <div className="text-red-400 font-mono text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Lat:</span>
              <span className="text-white">{mouseLatLon.lat.toFixed(4)}°</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Lon:</span>
              <span className="text-white">{mouseLatLon.lon.toFixed(4)}°</span>
            </div>
          </div>
        </div>
      )}
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
        </div>{" "}
        <div className="text-gray-300 text-xs space-y-1">
          <p>
            Zoom: {zoom}/{MAX_ZOOM}
          </p>
          <p>
            Grid: {mapDimensions.cols}×{mapDimensions.rows} tiles
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
