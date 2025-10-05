"use client";

import React from "react";
import SimpleProfileCard from "./SimpleProfileCard";
type Props = {
  name: string;
  role: string;
  avatarUrl: string;
  links?: { github?: string; linkedin?: string; site?: string };
};

export default function AboutUsProfileCard({ name, role, avatarUrl, links }: Props) {
  return (
    <div className="w-full">
      <SimpleProfileCard
        name={name}
        title={role}
        avatar={avatarUrl}
        github={links?.github}
      />
    </div>
  );
}
