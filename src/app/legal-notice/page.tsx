import { LegalPageTemplate } from "@/components/legal/LegalPageTemplate";
import { legalPages } from "@/data/legal";

export default function LegalNoticePage() {
  return <LegalPageTemplate data={legalPages.legal} />;
}
