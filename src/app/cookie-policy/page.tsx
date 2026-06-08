import { LegalPageTemplate } from "@/components/legal/LegalPageTemplate";
import { legalPages } from "@/data/legal";

export default function CookiePolicyPage() {
  return <LegalPageTemplate data={legalPages.cookie} />;
}
