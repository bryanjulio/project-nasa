import StarfieldAnimation from "../components/starfield-animation";

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <StarfieldAnimation duration={5} />
    </main>
  );
}
