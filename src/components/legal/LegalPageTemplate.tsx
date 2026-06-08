import { Reveal } from "@/components/common/Reveal";
import { SectionTitle } from "@/components/common/SectionTitle";
import type { LegalPageData } from "@/types/content";
import { LegalSection } from "./LegalSection";
import styles from "./LegalPageTemplate.module.scss";

type LegalPageTemplateProps = {
  data: LegalPageData;
};

export function LegalPageTemplate({ data }: LegalPageTemplateProps) {
  return (
    <Reveal className={styles.page} threshold={0.08}>
      <article>
        <SectionTitle eyebrow="Legal" title={data.title} />
        <div className={styles.sections}>
          {data.sections.map((section) => (
            <LegalSection key={section.id} {...section} />
          ))}
        </div>
      </article>
    </Reveal>
  );
}
