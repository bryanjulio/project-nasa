import { TileGrid, VisibleTiles } from "./types";

export const TILE_SIZE = 256;
export const MIN_ZOOM = 1; // Começa em 4×2 tiles (zoom 1)
export const MAX_ZOOM = 7; // Máximo zoom 7

/**
 * Calcula a grade de tiles para um nível de zoom
 * Baseado nas URLs REAIS do Mars Trek (testadas):
 * - Zoom 1: 4 cols × 2 rows (HORIZONTAL - 1024×512px)
 * - Zoom 2: 8 cols × 4 rows (2048×1024px)
 *
 * ATENÇÃO: Mars Trek usa projeção CILÍNDRICA EQUIDISTANTE!
 * Marte é mais LARGO (360° longitude) que ALTO (180° latitude)
 * Por isso: cols = 2×rows (sempre mais colunas que linhas)
 */
export function getTileGrid(zoom: number): TileGrid {
  return {
    cols: Math.pow(2, zoom + 1), // 2^(zoom+1) colunas (horizontal - longitude)
    rows: Math.pow(2, zoom), // 2^zoom linhas (vertical - latitude)
  };
}

/**
 * Calcula tiles visíveis no viewport atual
 */
export function calculateVisibleTiles(
  offset: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number,
  zoom: number
): VisibleTiles {
  const startCol = Math.floor(-offset.x / TILE_SIZE);
  const startRow = Math.floor(-offset.y / TILE_SIZE);
  const endCol = startCol + Math.ceil(canvasWidth / TILE_SIZE) + 1;
  const endRow = startRow + Math.ceil(canvasHeight / TILE_SIZE) + 1;

  return {
    minTileX: startCol,
    maxTileX: endCol,
    minTileY: startRow,
    maxTileY: endRow,
  };
}

/**
 * Normaliza coluna de tile para wrap-around horizontal
 * Marte é uma esfera: tiles fazem wrap horizontal seamlessly
 */
export function normalizeCol(col: number, zoom: number): number {
  const { cols } = getTileGrid(zoom);
  return ((col % cols) + cols) % cols;
}

/**
 * Verifica se uma linha de tile está dentro dos limites válidos
 * Não há wrap vertical (limites polares)
 */
export function isValidRow(row: number, zoom: number): boolean {
  const { rows } = getTileGrid(zoom);
  return row >= 0 && row < rows;
}

/**
 * Calcula limites verticais de offset para evitar pan além dos polos
 */
export function getVerticalOffsetLimits(
  zoom: number,
  canvasHeight: number
): { min: number; max: number } {
  const { rows } = getTileGrid(zoom);
  return {
    max: 0,
    min: -(rows * TILE_SIZE - canvasHeight),
  };
}
