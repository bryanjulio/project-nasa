import { NextRequest, NextResponse } from "next/server";

// Cache configuration constants
const CACHE_MAX_AGE = 2592000; // 30 days
const CACHE_S_MAXAGE = 604800; // 7 days

// NASA Trek API configuration
const MARS_LAYER = "Mars_Viking_MDIM21_ClrMosaic_global_232m";
const TILE_MATRIX_SET = "default028mm";

/**
 * Mars Tile Proxy - Fetches Mars surface tiles from NASA Trek API
 *
 * Query parameters:
 * - zoom: Zoom level (0-7)
 * - x: Tile X coordinate
 * - y: Tile Y coordinate
 *
 * Returns: JPEG image with aggressive caching headers
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const zoom = searchParams.get("zoom") || "0";
  const x = searchParams.get("x") || "0";
  const y = searchParams.get("y") || "0";

  try {
    const url = `https://trek.nasa.gov/tiles/Mars/EQ/${MARS_LAYER}/1.0.0/default/${TILE_MATRIX_SET}/${zoom}/${y}/${x}.jpg`;

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: "Tile not found" }, { status: 404 });
    }
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_S_MAXAGE}, immutable`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tile" },
      { status: 500 }
    );
  }
}
