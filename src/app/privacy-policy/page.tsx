import { LegalPageTemplate } from "@/components/legal/LegalPageTemplate";
import { legalPages } from "@/data/legal";

export default function PrivacyPolicyPage() {
  return <LegalPageTemplate data={legalPages.privacy} />;
}
