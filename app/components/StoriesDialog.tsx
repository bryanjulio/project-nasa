import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface StoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StoriesDialog({
  open,
  onOpenChange,
}: StoriesDialogProps) {
  const stories = [
    {
      id: "olympus-mons",
      name: "Olympus Mons",
      description:
        "Rise above Mars and witness Olympus Mons — a colossal volcano three times taller than Mount Everest. Formed by ancient eruptions and rivers of lava, it stands as the silent crown of the Red Planet’s volcanic past.",
      imageUrl: "/olympus-mons-volcano.webp",
    },
    {
      id: "valles-marineris",
      name: "Valles Marineris",
      description:
        "Dive into the heart of Mars through Valles Marineris — a canyon so vast it could stretch across the entire United States. Its towering cliffs and fractured terrain hold secrets of cataclysmic forces that tore the planet apart billions of years ago.",
      imageUrl: "/valles-marineris.webp",
    },
    {
      id: "mars-poles",
      name: "Mars Polar Ice Caps",
      description:
        "Journey to the frozen ends of Mars, where sunlight glitters across spiral ice patterns and hidden layers record the planet’s ancient climate. Beneath these polar caps of water and dry ice, Mars keeps the memory of its shifting seasons and vanished atmosphere.",
      imageUrl: "/mars-poles.webp",
    },
    {
      id: "cheyava-falls",
      name: "Cheyava Falls",
      description:
        "Explore Jezero Crater with NASA’s Perseverance rover and uncover Cheyava Falls — a Martian rock that may preserve traces of life from an ancient lakebed. Its mineral veins whisper the story of water, chemistry, and the timeless search for life beyond Earth.",
      imageUrl: "/cheyava-falls.webp",
    },
  ];

  function handleStoryClick(id: string) {
    window.location.search = `?story=${id}`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] md:max-w-[800px] grid-rows-[auto_1fr] min-h-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Pick a story</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 overflow-y-auto">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            {stories.length > 0 &&
              stories.map((story) => (
                <Card
                  key={story.name}
                  className="relative h-[200px] border p-0 rounded-lg overflow-hidden group cursor-pointer"
                  onClick={() => handleStoryClick(story.id)}
                >
                  <div className="absolute inset-0 h-[200px] overflow-hidden">
                    <Image
                      src={story.imageUrl}
                      alt={story.name}
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                  </div>

                  <div className="absolute h-[200px] inset-0 bg-black/60 transition-opacity duration-300 group-hover:opacity-50" />

                  <CardContent className="relative z-10 flex flex-col gap-2 text-white p-4">
                    <h1 className="font-semibold text-xl">{story.name}</h1>
                    <p className="text-sm text-white/80">{story.description}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
