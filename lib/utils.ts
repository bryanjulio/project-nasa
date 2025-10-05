import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export type Member = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  links?: {
    github?: string;
    linkedin?: string;
    site?: string;
  };
};

export const team: Member[] = [
  {
    id: "1",
    name: "Bryan Julio",
    role: "Developer Full Stack",
    avatarUrl: "/avatars/bryan.png",
    links: { github: "https://github.com/bryanjulio", linkedin: "https://google.com" }
  },
  {
    id: "2",
    name: "Erick Gomes",
    role: "UI/UX Designer",
    avatarUrl: "/avatars/erick.png",
    links: { github: "https://github.com/ericksoumes", linkedin: "https://google.com" }
  },
  {
    id: "3",
    name: "Diogo Paiva",
    role: "Developer Backend",
    avatarUrl: "/avatars/diogo.png",
    links: { github: "https://github.com/dppereira", site: "https://google.com" }
  },
  {
    id: "4",
    name: "Lucas Ferreira",
    role: "Developer Frontend",
    avatarUrl: "/avatars/lucas.png",
    links: { github: "https://github.com/lucasfeva", site: "https://google.com" }
    
  },
  {
    id: "5",
    name: "Pedro Dias",
    role: "IT Analyst",
    avatarUrl: "/avatars/pedro.png",
    links: { github: "https://github.com/japadiaz", site: "https://google.com" }
  }
];
