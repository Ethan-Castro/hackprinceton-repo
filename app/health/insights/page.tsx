import { Chat } from "@/components/chat";
import { DEFAULT_MODEL } from "@/lib/constants";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ modelId?: string }>;
}) {
  const params = await searchParams;
  const modelId = params?.modelId ?? DEFAULT_MODEL;
  return <Chat modelId={modelId} />;
}
