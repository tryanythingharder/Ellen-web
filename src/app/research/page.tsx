import { SectionTitle } from "@/components/common/SectionTitle";
import { ResearchGrid } from "@/components/research/ResearchGrid";
import { researchEntries } from "@/data/research";

export default function ResearchPage() {
  return (
    <section className="page-shell page-shell--archive">
      <SectionTitle
        eyebrow="Archive"
        summary="References, tests, scans, and image fragments held as a working index."
        title="Research"
      />
      <ResearchGrid entries={researchEntries} />
    </section>
  );
}
