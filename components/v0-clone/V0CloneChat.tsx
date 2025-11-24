"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewUrl,
} from "@/components/ai-elements/web-preview";
import { Loader } from "@/components/ai-elements/loader";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatHistoryEntry = {
  id: string;
  type: "user" | "assistant";
  content: string;
};

type ChatSummary = {
  id: string;
  demo: string | null;
};

interface V0CloneChatProps {
  className?: string;
}

const EXAMPLE_PROMPTS = [
  "Build a polished SaaS landing page with hero, features, and pricing",
  "Create a dashboard with charts, stats cards, and a recent activity list",
  "Design a mobile-first travel blog homepage",
  "Make a coffee shop website with menu, gallery, and contact form",
];

const createMessageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

export function V0CloneChat({ className }: V0CloneChatProps) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatSummary | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (promptMessage: PromptInputMessage) => {
    const hasText = Boolean(promptMessage.text?.trim());
    const hasAttachments = Boolean(promptMessage.files?.length);

    if (!(hasText || hasAttachments) || isLoading) {
      return;
    }

    const userMessage = promptMessage.text?.trim() || "Sent with attachments";
    const messageId = createMessageId();

    setChatHistory((prev) => [
      ...prev,
      { id: messageId, type: "user", content: userMessage },
    ]);
    setMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v0-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: currentChat?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error ||
            "Failed to create chat. Check your V0_API_KEY configuration.",
        );
      }

      const chat: { id: string; demo: string | null } = await response.json();
      setCurrentChat(chat);
      const fileHtml =
        Array.isArray((chat as any).files) && (chat as any).files[0]?.content
          ? (chat as any).files[0].content
          : null;
      setPreviewHtml(fileHtml);
      setChatHistory((prev) => [
        ...prev,
        {
          id: createMessageId(),
          type: "assistant",
          content: "Generated new app preview. Check the preview panel!",
        },
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process request";
      setError(errorMessage);
      setChatHistory((prev) => [
        ...prev,
        {
          id: createMessageId(),
          type: "assistant",
          content: "Sorry, there was an issue reaching v0. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setCurrentChat(null);
    setPreviewHtml(null);
    setMessage("");
    setError(null);
  };

  return (
    <div className={cn("flex h-full flex-col md:flex-row", className)}>
      {/* Chat column */}
      <div className="flex h-full flex-1 flex-col border-r bg-background">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm text-muted-foreground">v0 clone</p>
            <h2 className="text-lg font-semibold">What can we build?</h2>
          </div>
          {chatHistory.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              New chat
            </Button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          {chatHistory.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-semibold">
                  Describe what you want to build
                </h3>
                <p className="text-sm text-muted-foreground">
                  I&apos;ll send your prompt to v0 and stream the preview on the
                  right.
                </p>
                <Suggestions className="mt-6 text-left">
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <Suggestion
                      key={prompt}
                      suggestion={prompt}
                      onClick={() => setMessage(prompt)}
                    />
                  ))}
                </Suggestions>
              </div>
            </div>
          ) : (
            <>
              <Conversation>
                <ConversationContent>
                  {chatHistory.map((entry) => (
                    <Message from={entry.type} key={entry.id}>
                      <MessageContent>{entry.content}</MessageContent>
                    </Message>
                  ))}
                </ConversationContent>
              </Conversation>
              {isLoading && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader />
                      Creating your app...
                    </div>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </div>

        <div className="border-t px-4 py-4">
          {error && (
            <Alert variant="destructive" className="mb-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <PromptInput onSubmit={handleSendMessage} className="w-full">
            <PromptInputTextarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the UI you want to build..."
              className="min-h-[72px] pr-12"
              disabled={isLoading}
            />
            <PromptInputSubmit
              className="absolute bottom-2 right-2"
              disabled={!message.trim() || isLoading}
              status={isLoading ? "streaming" : "ready"}
            />
          </PromptInput>
        </div>
      </div>

      {/* Preview column */}
      <div className="flex h-[420px] flex-1 flex-col border-t bg-muted/30 md:h-full md:border-l md:border-t-0">
        <WebPreview className="flex-1 bg-background">
          <WebPreviewNavigation>
            <WebPreviewUrl
              readOnly
              placeholder="Your app will appear here..."
              value={currentChat?.demo ?? ""}
            />
          </WebPreviewNavigation>
          <WebPreviewBody
            src={currentChat?.demo ?? undefined}
            srcDoc={previewHtml ?? undefined}
            loading={<Loader />}
          />
        </WebPreview>
      </div>
    </div>
  );
}
