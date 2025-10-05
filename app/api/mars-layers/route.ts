import { NextResponse } from "next/server";

/**
 * Lista de camadas Mars disponíveis na NASA Trek
 * Baseado na documentação oficial: https://trek.nasa.gov/
 */

export interface MarsLayer {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  tileMatrixSet: string;
  format: "jpg" | "png";
  minZoom: number;
  maxZoom: number;
  style?: string;
}

const MARS_LAYERS: MarsLayer[] = [
  {
    id: "viking_color",
    name: "Viking MDIM 2.1 Color",
    description: "Mars Viking Color Mosaic (232m/pixel)",
    endpoint: "Mars_Viking_MDIM21_ClrMosaic_global_232m",
    tileMatrixSet: "default028mm",
    format: "jpg",
    minZoom: 0,
    maxZoom: 7,
    style: "default",
  },
  {
    id: "viking_gray",
    name: "Viking MDIM 2.1 Grayscale",
    description: "Mars Viking Grayscale Mosaic (232m/pixel)",
    endpoint: "Mars_Viking_MDIM21_Mosaic_global_232m",
    tileMatrixSet: "default028mm",
    format: "jpg",
    minZoom: 0,
    maxZoom: 7,
    style: "default",
  },
  {
    id: "mola_color",
    name: "MOLA Color Shaded Relief",
    description: "Mars Orbiter Laser Altimeter - Color (463m/pixel)",
    endpoint: "Mars_MGS_MOLA_ClrShade_merge_global_463m",
    tileMatrixSet: "default028mm",
    format: "png",
    minZoom: 0,
    maxZoom: 6,
    style: "default",
  },
  {
    id: "mola_gray",
    name: "MOLA Grayscale Shaded Relief",
    description: "Mars Orbiter Laser Altimeter - Grayscale (463m/pixel)",
    endpoint: "Mars_MGS_MOLA_Shade_global_463m",
    tileMatrixSet: "default028mm",
    format: "png",
    minZoom: 0,
    maxZoom: 6,
    style: "default",
  },
  {
    id: "themis_day",
    name: "THEMIS Daytime IR",
    description: "Thermal Emission Imaging System - Day (100m/pixel)",
    endpoint: "Mars_MO_THEMIS_Day_IR_global_100m",
    tileMatrixSet: "default028mm",
    format: "png",
    minZoom: 0,
    maxZoom: 8,
    style: "default",
  },
  {
    id: "themis_night",
    name: "THEMIS Nighttime IR",
    description: "Thermal Emission Imaging System - Night (100m/pixel)",
    endpoint: "Mars_MO_THEMIS_Night_IR_global_100m",
    tileMatrixSet: "default028mm",
    format: "png",
    minZoom: 0,
    maxZoom: 8,
    style: "default",
  },
];

/**
 * GET /api/mars-layers
 * Retorna lista de camadas disponíveis
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      layers: MARS_LAYERS,
      count: MARS_LAYERS.length,
    });
  } catch (error) {
    console.error("Error fetching Mars layers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch layers" },
      { status: 500 }
    );
  }
}
