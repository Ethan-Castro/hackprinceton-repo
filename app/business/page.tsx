import { DomainHub } from "@/components/domain-hub";
import { businessConfig } from "@/config/domains/business";

export default function BusinessHubPage() {
  return <DomainHub config={businessConfig} />;
}
