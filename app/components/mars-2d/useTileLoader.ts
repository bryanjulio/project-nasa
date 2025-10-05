import { useCallback, useRef, useState } from "react";
import { TileCache } from "./TileCache";

export interface LayerConfig {
  endpoint: string;
  tileMatrixSet: string;
  format: "jpg" | "png";
  style?: string;
}

/**
 * Hook para carregar tiles com cache e controle de requisições
 */
export function useTileLoader(layer?: LayerConfig) {
  const [loadingCount, setLoadingCount] = useState(0);
  const tileCacheRef = useRef(new TileCache(500));
  const loadingTilesRef = useRef(new Set<string>());
  const abortControllersRef = useRef(new Map<string, AbortController>());
  const currentLayerRef = useRef(layer?.endpoint);

  /**
   * Carrega um tile individual com cache
   */
  const loadTile = useCallback(
    async (
      z: number,
      col: number,
      row: number
    ): Promise<ImageBitmap | null> => {
      const layerKey = layer?.endpoint || "default";
      const key = `${layerKey}-${z}-${col}-${row}`;

      // Se mudou de layer, limpar cache
      if (currentLayerRef.current !== layer?.endpoint) {
        tileCacheRef.current.clear();
        currentLayerRef.current = layer?.endpoint;
      }

      // Verificar cache primeiro
      const cached = tileCacheRef.current.get(key);
      if (cached) {
        return cached;
      }

      // Prevenir requisições duplicadas
      if (loadingTilesRef.current.has(key)) {
        return null;
      }

      loadingTilesRef.current.add(key);
      setLoadingCount((prev) => prev + 1);

      const controller = new AbortController();
      abortControllersRef.current.set(key, controller);
      try {
        // CORRIGIDO: Enviamos row e col, API monta /zoom/row/col
        const params = new URLSearchParams({
          zoom: z.toString(),
          row: row.toString(), // TileRow (vertical) - vai primeiro na URL
          col: col.toString(), // TileCol (horizontal) - vai depois na URL
        });

        if (layer?.endpoint) params.set("layer", layer.endpoint);
        if (layer?.tileMatrixSet)
          params.set("tileMatrixSet", layer.tileMatrixSet);
        if (layer?.format) params.set("format", layer.format);
        if (layer?.style) params.set("style", layer.style);

        const url = `/api/mars-tile?${params.toString()}`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const img = await createImageBitmap(blob);

        tileCacheRef.current.set(key, img);

        return img;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return null;
        }
        console.warn(`Erro ao carregar tile ${key}:`, (error as Error).message);
        return null;
      } finally {
        loadingTilesRef.current.delete(key);
        abortControllersRef.current.delete(key);
        setLoadingCount((prev) => prev - 1);
      }
    },
    [layer]
  );

  /**
   * Cancela todas as requisições em andamento
   */
  const cancelAll = useCallback(() => {
    abortControllersRef.current.forEach((ctrl) => ctrl.abort());
    loadingTilesRef.current.clear();
    abortControllersRef.current.clear();
    setLoadingCount(0);
  }, []);

  /**
   * Limpa o cache de tiles
   */
  const clearCache = useCallback(() => {
    tileCacheRef.current.clear();
  }, []);

  return {
    loadTile,
    cancelAll,
    clearCache,
    loadingCount,
    cacheSize: tileCacheRef.current.size,
  };
}
