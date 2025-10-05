"use client";

import { useEffect, useRef } from "react";

interface Coordinate {
  lat: number;
  lon: number;
  zoom?: number;
}

interface MarsCoordinatesHook {
  currentCoordinate: Coordinate | null;
  setCoordinate: (coord: Coordinate) => void;
}

export const useMarsCoordinates = (): MarsCoordinatesHook => {
  const currentCoordinateRef = useRef<Coordinate | null>(null);

  const setCoordinate = (coord: Coordinate) => {
    currentCoordinateRef.current = coord;

    // Disparar evento customizado para comunicar com o sistema 3D
    const event = new CustomEvent("mars-coordinate-change", {
      detail: coord,
    });
    window.dispatchEvent(event);
  };

  return {
    currentCoordinate: currentCoordinateRef.current,
    setCoordinate,
  };
};

// Hook para escutar mudanças de coordenadas no sistema 3D
export const useMarsCoordinateListener = (
  callback: (coord: Coordinate) => void
) => {
  useEffect(() => {
    const handleCoordinateChange = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener(
      "mars-coordinate-change",
      handleCoordinateChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "mars-coordinate-change",
        handleCoordinateChange as EventListener
      );
    };
  }, [callback]);
};
