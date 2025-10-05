// app/mars-test/page.tsx

import MarsMap2D from "../components/mars-2d/MarsMap2D";

export const metadata = {
  title: "Mars Viewer - NASA Viking MDIM 2.1",
  description: "Visualizador interativo 2D da superfície de Marte",
};

interface MarsTestPageProps {
  searchParams: Promise<{ lat?: string; lon?: string }>;
}

export default async function MarsTestPage({
  searchParams,
}: MarsTestPageProps) {
  const params = await searchParams;
  const latitude = params.lat ? parseFloat(params.lat) : undefined;
  const longitude = params.lon ? parseFloat(params.lon) : undefined;

  return (
    <div className="w-screen h-screen overflow-hidden">
      <MarsMap2D latitude={latitude} longitude={longitude} />
    </div>
  );
}
