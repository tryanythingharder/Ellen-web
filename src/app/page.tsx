import { DraftProjectProvider } from "@/components/content/DraftProjectProvider";
import { projects } from "@/data/projects";

export default function Home() {
  return <DraftProjectProvider projects={projects} />;
}
