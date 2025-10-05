import { getTileGrid, TILE_SIZE } from "./utils";

/**
 * Converte latitude/longitude para coordenadas de pixel no mapa
 * @param lat Latitude (-90 a 90, onde 90 = polo norte)
 * @param lon Longitude (0 a 360, onde 0 = meridiano primário)
 * @param zoom Nível de zoom
 * @returns Coordenadas x, y em pixels no mapa
 */
export function latLonToPixel(lat: number, lon: number, zoom: number) {
  const { cols, rows } = getTileGrid(zoom);
  const mapWidth = cols * TILE_SIZE;
  const mapHeight = rows * TILE_SIZE;

  // Normalizar longitude (0-360)
  let normalizedLon = ((lon % 360) + 360) % 360;

  // A NASA Trek usa projeção onde 180° está no centro
  // Ajustar longitude para centralizar em 180°
  normalizedLon = (normalizedLon + 180) % 360;

  // Converter para coordenadas de pixel
  const x = (normalizedLon / 360) * mapWidth;

  // Latitude: 90° = topo, -90° = fundo (projeção cilíndrica equidistante)
  const y = ((90 - lat) / 180) * mapHeight;

  return { x, y };
}

/**
 * Converte coordenadas de pixel no mapa para latitude/longitude
 * @param x Coordenada X em pixels no mapa
 * @param y Coordenada Y em pixels no mapa
 * @param zoom Nível de zoom
 * @returns Latitude e longitude
 */
export function pixelToLatLon(x: number, y: number, zoom: number) {
  const { cols, rows } = getTileGrid(zoom);
  const mapWidth = cols * TILE_SIZE;
  const mapHeight = rows * TILE_SIZE;

  // Converter pixel para longitude (0-360 ajustado)
  const normalizedLon = (x / mapWidth) * 360;

  // Reverter o ajuste de +180
  const lon = (normalizedLon - 180 + 360) % 360;

  // Converter pixel para latitude
  const lat = 90 - (y / mapHeight) * 180;

  return { lat, lon };
}
