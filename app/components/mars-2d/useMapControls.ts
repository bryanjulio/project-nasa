import { useState, useRef, useCallback } from "react";
import {
  getTileGrid,
  getVerticalOffsetLimits,
  MIN_ZOOM,
  MAX_ZOOM,
} from "./utils";

/**
 * Hook para controlar zoom, pan e interações do mapa
 */
export function useMapControls(canvasHeight: number) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  /**
   * Aumenta o zoom (máximo 6)
   */
  const zoomIn = useCallback(() => {
    if (zoom < MAX_ZOOM) {
      setZoom((z) => z + 1);
      setOffset((prev) => ({
        x: prev.x * 2,
        y: prev.y * 2,
      }));
    }
  }, [zoom]);

  /**
   * Diminui o zoom (mínimo 1)
   */
  const zoomOut = useCallback(() => {
    if (zoom > MIN_ZOOM) {
      setZoom((z) => z - 1);
      setOffset((prev) => ({
        x: prev.x / 2,
        y: prev.y / 2,
      }));
    }
  }, [zoom]);

  /**
   * Inicia arrasto do mapa
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      dragOffsetRef.current = { ...offset };
    },
    [offset]
  );

  /**
   * Move o mapa durante arrasto
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      const newOffset = {
        x: dragOffsetRef.current.x + dx,
        y: dragOffsetRef.current.y + dy,
      };

      // Limitar vertical (sem wrap nos polos)
      const limits = getVerticalOffsetLimits(zoom, canvasHeight);
      newOffset.y = Math.max(limits.min, Math.min(limits.max, newOffset.y));

      setOffset(newOffset);
    },
    [isDragging, zoom, canvasHeight]
  );

  /**
   * Finaliza arrasto do mapa
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    zoom,
    offset,
    isDragging,
    zoomIn,
    zoomOut,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getTileGrid: () => getTileGrid(zoom),
  };
}
