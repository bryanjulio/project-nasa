// app/mars-test/page.tsx

import MarsMap2D from "../components/mars-2d/MarsMap2D";

export const metadata = {
  title: "Mars Viewer - NASA Viking MDIM 2.1",
  description: "Visualizador interativo 2D da superfície de Marte",
};

export default function MarsTestPage() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <MarsMap2D />
    </div>
  );
}
