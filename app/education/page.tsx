import { DomainHub } from "@/components/domain-hub";
import { educationConfig } from "@/config/domains/education";

export default function EducationHubPage() {
  return <DomainHub config={educationConfig} />;
}
