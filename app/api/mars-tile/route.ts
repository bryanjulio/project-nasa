import { NextRequest, NextResponse } from "next/server";

const CACHE_MAX_AGE = 2592000; // 30 dias
const CACHE_S_MAXAGE = 604800; // 7 dias

/**
 * Mars Tile Proxy - Suporta múltiplas camadas
 *
 * NASA Trek WMTS URL structure (CONFIRMADO):
 * https://trek.nasa.gov/tiles/Mars/EQ/{Layer}/1.0.0/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.{format}
 *
 * ATENÇÃO: A ordem é TileRow/TileCol (Y/X) - LINHA antes de COLUNA!
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const zoom = searchParams.get("zoom") || "1";
  const row = searchParams.get("row") || "0"; // TileRow (vertical)
  const col = searchParams.get("col") || "0"; // TileCol (horizontal)
  const layer =
    searchParams.get("layer") || "Mars_Viking_MDIM21_ClrMosaic_global_232m";
  const style = searchParams.get("style") || "default";
  const tileMatrixSet = searchParams.get("tileMatrixSet") || "default028mm";
  const format = searchParams.get("format") || "jpg";

  try {
    // NASA Trek WMTS: /zoom/TileRow/TileCol (linha/coluna)
    const url = `https://trek.nasa.gov/tiles/Mars/EQ/${layer}/1.0.0/${style}/${tileMatrixSet}/${zoom}/${row}/${col}.${format}`;

    console.log(
      JSON.stringify(
        {
          apiReceived: { row: row, col: col },
          nasaTrekUrl: `/${zoom}/${row}/${col}.${format}`,
          interpretation: `zoom=${zoom}, TileRow=${row}(vertical), TileCol=${col}(horizontal)`,
        },
        null,
        2
      )
    );

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Tile not found", url },
        { status: 404 }
      );
    }

    const imageBuffer = await response.arrayBuffer();

    // Determinar Content-Type baseado no formato
    const contentType = format === "png" ? "image/png" : "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_S_MAXAGE}, immutable`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Erro ao buscar tile:", error);
    return NextResponse.json(
      { error: "Failed to fetch tile" },
      { status: 500 }
    );
  }
}
