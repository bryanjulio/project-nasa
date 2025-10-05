"use client";

import { useState } from "react";
import SimpleProfileCard from "./SimpleProfileCard";
import ModalAbout from "./ModalAbout";
import { team } from "../../lib/utils";

export default function AboutUs() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-2xl px-5 py-2 text-base shadow-sm hover:shadow md:text-lg
                   bg-black text-white dark:bg-white dark:text-black transition"
      >
        About the Project
      </button>

      <ModalAbout open={open} onClose={() => setOpen(false)} maxWidth="max-w-5xl">
        <div className="space-y-6">
          {/* Header */}
          <header className="space-y-1">
            <h2 className="text-2xl font-semibold">About the Project</h2>
            <p className="text-sm opacity-70">
              NASA Space Apps Challenge 2025, Embiggen Your Eyes.  
              Data visualization, exploration, and interactive experiences.  
              Built with Next.js 15, React 19, and Tailwind v4.
            </p>
          </header>

          {/* Storytelling */}
          <section className="space-y-3">
            <h3 className="text-lg font-medium">Our Journey, Beyond Pixels</h3>
            <p className="opacity-90">
              In October 2025, during the <strong>NASA Space Apps Challenge</strong>, our team
              <strong> Beyond Pixels</strong> came together in <strong>Campinas, Brazil</strong> to join one of the
              largest hackathons on Earth and beyond. The event went ahead as planned and reminded us that human
              curiosity does not stop and exploration always finds a way.
            </p>
            <p className="opacity-90">
              We are developers, designers, and space enthusiasts. Our mission is to turn
              <strong> NASA’s massive image and data archives</strong> into accessible, interactive, and inspiring
              experiences, revealing patterns, stories, and discoveries that reshape how we see the universe.
            </p>
          </section>

          {/* About the Challenge */}
          <section className="space-y-2">
            <h3 className="text-lg font-medium">The Challenge, Embiggen Your Eyes</h3>
            <p className="opacity-90">
              A phone screen shows about three million pixels and the human eye perceives more than ten million, yet
              NASA mission imagery reaches <strong>billions and even trillions of pixels</strong>. The challenge asks
              for a platform that explores these huge datasets, zooms smoothly, labels known features, and helps people
              discover new patterns and details.
            </p>
            <p className="opacity-90">
              For us this is not only about seeing closer. It is about <strong>making the unreachable reachable</strong>.
            </p>
          </section>

          {/* Our Approach */}
          <section className="space-y-2">
            <h3 className="text-lg font-medium">Our Approach, Exploring Mars Beyond Pixels</h3>
            <p className="opacity-90">
              We chose <strong>Mars</strong> as our playground, a world that has inspired scientists and dreamers for
              generations. We built an <strong>interactive 3D representation of Mars</strong> using real NASA imagery
              and elevation data. Users can fly across valleys and craters and ask our <strong>integrated AI</strong>
              questions about what they see, from geologic formations and historic landing sites to mission context and
              scientific insights.
            </p>
            <ul className="ms-5 list-disc space-y-1">
              <li>
                <strong>3D Exploration:</strong> immersive navigation over Martian terrain with geospatial layers.
              </li>
              <li>
                <strong>AI Assistant:</strong> natural language answers with context, EN and PT supported.
              </li>
              <li>
                <strong>Points of Interest:</strong> history, scientific relevance, related missions, and references.
              </li>
              <li>
                <strong>Ultra high resolution 2D images:</strong> millions of pixels for extreme zoom and close study.
              </li>
            </ul>
          </section>

          {/* Why it matters */}
          <section className="space-y-2">
            <h3 className="text-lg font-medium">Why It Matters</h3>
            <p className="opacity-90">
              Space data is <strong>our open window to the cosmos</strong>, but only if we can make sense of it. By
              combining <strong>3D visualization, AI, and storytelling</strong>, we turn static datasets into living,
              educational experiences that anyone can explore from anywhere.
            </p>
            <p className="opacity-90">
              Our goal is simple. <strong>Bring space closer</strong>, one pixel at a time.
            </p>
          </section>

          {/* Technologies */}
          <section className="space-y-2">
            <h3 className="text-lg font-medium">Technologies</h3>
            <p className="opacity-80">
              Next.js App Router, React Server and Client Components, Tailwind v4, and integration with geospatial
              data services using WMTS. 3D rendering runs on the client for high performance and responsive visuals.
            </p>
          </section>

          {/* Team */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Team</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m) => (
                <SimpleProfileCard
                  key={m.id}
                  name={m.name}
                  role={m.role}
                  avatarUrl={m.avatarUrl}
                  links={m.links}
                />
              ))}
            </div>
          </section>

          {/* Credits and NASA context */}
          <footer className="pt-4 text-xs opacity-70 text-center border-t border-white/10">
            <p>
              NASA Space Apps Challenge 2025, Local Event Campinas, Brazil, Challenge Embiggen Your Eyes
            </p>
            <p>
              Funded by NASA’s Earth Science Division through contracts with Booz Allen Hamilton, Mindgrub, and SecondMuse.
            </p>
            <p>© 2025 NASA | Privacy Policy | Legal | Contact | Resources</p>
          </footer>
        </div>
      </ModalAbout>
    </>
  );
}
