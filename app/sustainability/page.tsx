import { DomainHub } from "@/components/domain-hub";
import { sustainabilityConfig } from "@/config/domains/sustainability";

export default function SustainabilityPage() {
  return <DomainHub config={sustainabilityConfig} />;
}
