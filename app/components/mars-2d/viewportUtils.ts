import { TILE_SIZE } from "./utils";

export interface TileInfo {
  col: number;
  row: number;
  x: number;
  y: number;
  distance: number;
}

export interface ViewportBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Calcula os tiles visíveis no viewport atual
 * @param viewportWidth Largura do viewport
 * @param viewportHeight Altura do viewport
 * @param startX Posição X inicial do mapa
 * @param startY Posição Y inicial do mapa
 * @param cols Total de colunas no grid
 * @param rows Total de linhas no grid
 * @param margin Margem extra para pré-carregar tiles adjacentes
 * @returns Array de tiles visíveis, ordenados por distância do centro
 */
export function getVisibleTiles(
  viewportWidth: number,
  viewportHeight: number,
  startX: number,
  startY: number,
  cols: number,
  rows: number,
  margin: number = TILE_SIZE
): TileInfo[] {
  // Calcular bounds do viewport com margem
  const viewportLeft = -startX - margin;
  const viewportTop = -startY - margin;
  const viewportRight = -startX + viewportWidth + margin;
  const viewportBottom = -startY + viewportHeight + margin;

  // Calcular range de tiles visíveis
  const startCol = Math.max(0, Math.floor(viewportLeft / TILE_SIZE));
  const endCol = Math.min(cols - 1, Math.floor(viewportRight / TILE_SIZE));
  const startRow = Math.max(0, Math.floor(viewportTop / TILE_SIZE));
  const endRow = Math.min(rows - 1, Math.floor(viewportBottom / TILE_SIZE));

  // Centro do viewport para priorização
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;

  const visibleTiles: TileInfo[] = [];

  // Coletar todos os tiles visíveis
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const drawX = Math.floor(startX + col * TILE_SIZE);
      const drawY = Math.floor(startY + row * TILE_SIZE);

      // Calcular distância do centro para priorização
      const tileCenterX = drawX + TILE_SIZE / 2;
      const tileCenterY = drawY + TILE_SIZE / 2;
      const distance = Math.sqrt(
        Math.pow(tileCenterX - centerX, 2) + Math.pow(tileCenterY - centerY, 2)
      );

      visibleTiles.push({ col, row, x: drawX, y: drawY, distance });
    }
  }

  // Ordenar por distância: tiles mais próximos do centro carregam primeiro
  visibleTiles.sort((a, b) => a.distance - b.distance);

  return visibleTiles;
}

/**
 * Calcula as estatísticas de carregamento de tiles
 * @param totalTiles Total de tiles no grid
 * @param visibleTiles Número de tiles visíveis
 * @returns Estatísticas de otimização
 */
export function getTileStats(totalTiles: number, visibleTiles: number) {
  const reduction = ((totalTiles - visibleTiles) / totalTiles) * 100;
  return {
    total: totalTiles,
    visible: visibleTiles,
    reduction: Math.round(reduction),
    efficiency: Math.round((visibleTiles / totalTiles) * 100),
  };
}
