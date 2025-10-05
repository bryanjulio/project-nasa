export interface TileCoordinates {
  z: number; // Zoom level
  x: number; // TileCol
  y: number; // TileRow
}

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TileGrid {
  cols: number; // 2^zoom colunas
  rows: number; // 2^(zoom-1) linhas
}

export interface MapState {
  zoom: number;
  center: [number, number]; // [longitude, latitude]
  offset: { x: number; y: number };
}

export interface VisibleTiles {
  minTileX: number;
  maxTileX: number;
  minTileY: number;
  maxTileY: number;
}
