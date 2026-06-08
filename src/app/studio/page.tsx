import { SectionTitle } from "@/components/common/SectionTitle";
import { StudioSection } from "@/components/studio/StudioSection";
import { studioPageData } from "@/data/studio";

export default function StudioPage() {
  const mediaSlot = studioPageData.mediaSlots?.[0];

  return (
    <section className="page-shell page-shell--studio">
      <SectionTitle
        eyebrow="Studio"
        summary={studioPageData.intro}
        title="Information"
      />

      <div className="studio-sections">
        <StudioSection title="Services" items={studioPageData.services} />
        <StudioSection title="Clients" items={studioPageData.clients} />
        <StudioSection title="Press" items={studioPageData.press} />
        <StudioSection
          title="Recognitions"
          items={studioPageData.recognitions}
          media={mediaSlot?.media}
        />
      </div>
    </section>
  );
}
