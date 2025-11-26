import { DomainHub } from "@/components/domain-hub";
import { healthConfig } from "@/config/domains/health";

export default function HealthHubPage() {
  return <DomainHub config={healthConfig} />;
}
