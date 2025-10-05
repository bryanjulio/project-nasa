import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StoriesDialogProps {
  isOpen: boolean;
}

export default function StoriesDialog({ isOpen }: StoriesDialogProps) {
  const stories = [
    {
      id: "olympus-mons",
      name: "Olympus Mons",
      description:
        "This story is about Olympus Mons, the giant volcano on Mars — towering 27 km high, with vast lava flows and a massive summit crater shaped by ancient eruptions.",
      imageUrl: "/olympus-mons-volcano.webp",
    },
    {
      id: "valles-marineris",
      name: "Valles Marineris",
      description:
        "This story is about Valles Marineris, the vast canyon on Mars — stretching over 3,000 km long and up to 8 km deep, carved by ancient forces that shaped the planet’s surface.",
      imageUrl: "/valles-marineris.webp",
    },
    {
      id: "mars-poles",
      name: "Mars Polar Ice Caps",
      description:
        "This story is about Mars’ Polar Ice Caps, vast frozen regions made of water and carbon dioxide ice — marked by spiral troughs and deep canyons that reveal the planet’s icy climate history.",
      imageUrl: "/mars-poles.webp",
    },
    {
      id: "cheyava-falls",
      name: "Cheyava Falls",
      description:
        "This story is about Cheyava Falls, a Martian rock studied by NASA’s Perseverance rover. Found in Jezero Crater, it may hold **potential biosignatures** — chemical clues that could point to ancient microbial life on Mars.",
      imageUrl: "/cheyava-falls.webp",
    },
  ];

  function handleStoryClick(id: string) {
    window.location.search = `?story=${id}`;
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-h-[92vh] grid-rows-[auto_1fr] min-h-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Pick a story</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {stories.length > 0 &&
              stories.map((story) => (
                <Card
                  key={story.name}
                  className="relative bg-cover bg-center border p-0 rounded-lg overflow-hidden group hover:shadow-white/20 transition-shadow duration-300"
                  style={{ backgroundImage: `url('${story.imageUrl}')` }}
                  onClick={() => handleStoryClick(story.id)}
                >
                  <div className="absolute inset-0 bg-black/60 transition-opacity duration-300 group-hover:opacity-50" />
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
