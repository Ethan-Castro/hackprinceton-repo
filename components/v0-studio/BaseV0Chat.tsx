"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy, ExternalLink, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  extractReactCode,
  createCodeSandboxUrl,
  validateCode,
  copyToClipboard,
} from "@/lib/extract-code";

// AI Elements Imports
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
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "@/components/ai-elements/web-preview";
import { Loader } from "@/components/ai-elements/loader";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface SavedChat {
  id: string;
  title: string;
  previewUrl?: string | null;
  updatedAt?: string | null;
}

export interface BaseV0ChatProps {
  className?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  examplePrompts: string[];
  systemPrompt?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

function normalizeMessageContent(content: any): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          if ("text" in item && typeof item.text === "string") return item.text;
          if ("content" in item && typeof item.content === "string")
            return item.content;
        }
        try {
          return JSON.stringify(item);
        } catch {
          return "";
        }
      })
      .filter(Boolean)
      .join("\n\n");
  }

  if (content && typeof content === "object") {
    if ("text" in content && typeof content.text === "string")
      return content.text;
    if ("content" in content && typeof content.content === "string")
      return content.content;
  }

  if (content == null) return "";

  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}

function transformApiMessages(apiMessages: any[]): ChatMessage[] {
  return apiMessages
    .filter(
      (msg: any) => msg && (msg.role === "user" || msg.role === "assistant")
    )
    .map((msg: any) => ({
      id:
        typeof msg.id === "string" && msg.id.length > 0
          ? msg.id
          : `${msg.role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: msg.role as "user" | "assistant",
      content: normalizeMessageContent(msg.content),
      createdAt:
        typeof msg.createdAt === "string"
          ? msg.createdAt
          : new Date().toISOString(),
    }))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export function BaseV0Chat({
  className,
  title,
  subtitle,
  icon,
  examplePrompts,
  systemPrompt,
  emptyStateTitle = "What can we build together?",
  emptyStateDescription = "Describe what you want to create, and I'll generate it for you.",
}: BaseV0ChatProps) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [loadingSavedChats, setLoadingSavedChats] = useState(false);
  const [loadingChatDetail, setLoadingChatDetail] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSavedChats = useCallback(async () => {
    if (status !== "authenticated") {
      setSavedChats([]);
      return;
    }

    setLoadingSavedChats(true);
    try {
      const response = await fetch("/api/textbook-studio/chats");
      if (!response.ok) {
        throw new Error("Failed to load saved chats");
      }

      const data = await response.json();
      const chats = Array.isArray(data.chats) ? data.chats : [];

      const mappedChats: SavedChat[] = chats
        .filter((chat: any) => chat && typeof chat.id === "string")
        .map((chat: any) => {
          const firstUserMessage = Array.isArray(chat.messages)
            ? chat.messages.find((msg: any) => msg.role === "user")
            : null;
          const fallbackTitle =
            firstUserMessage && firstUserMessage.content
              ? normalizeMessageContent(firstUserMessage.content)
              : "";

          return {
            id: chat.id,
            title:
              typeof chat.title === "string" && chat.title.length > 0
                ? chat.title
                : typeof chat.name === "string" && chat.name.length > 0
                ? chat.name
                : fallbackTitle.length > 0
                ? fallbackTitle.slice(0, 60)
                : `Chat ${chat.id}`,
            previewUrl:
              typeof chat.demo === "string"
                ? chat.demo
                : typeof chat.previewUrl === "string"
                ? chat.previewUrl
                : null,
            updatedAt:
              typeof chat.updatedAt === "string"
                ? chat.updatedAt
                : typeof chat.createdAt === "string"
                ? chat.createdAt
                : null,
          };
        });

      mappedChats.sort((a, b) => {
        if (a.updatedAt && b.updatedAt) {
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }
        return 0;
      });

      setSavedChats(mappedChats);
    } catch (err) {
      console.error(err);
      setSavedChats([]);
    } finally {
      setLoadingSavedChats(false);
    }
  }, [status]);

  const loadChat = useCallback(
    async (targetChatId: string) => {
      if (!targetChatId || loadingChatDetail) return;

      setChatId(targetChatId);
      setError(null);
      setLoadingChatDetail(true);

      try {
        const response = await fetch(
          `/api/textbook-studio/chats/${encodeURIComponent(targetChatId)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load chat");
        }

        const chatData = data.chat || data.response || {};
        const chatMessages = transformApiMessages(chatData.messages || []);

        setMessages(chatMessages);

        if (chatData.demo || chatData.previewUrl) {
          setPreviewUrl(chatData.demo || chatData.previewUrl || null);
        } else {
          const matchedChat = savedChats.find(
            (chat) => chat.id === targetChatId
          );
          setPreviewUrl(matchedChat?.previewUrl || null);
        }
      } catch (err: any) {
        console.error("Error loading chat:", err);
        setError(err.message || "Failed to load chat");
      } finally {
        setLoadingChatDetail(false);
      }
    },
    [savedChats, loadingChatDetail]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    void fetchSavedChats();
  }, [fetchSavedChats]);

  const handleSubmit = async (promptMessage: PromptInputMessage) => {
    const hasText = Boolean(promptMessage.text);
    const hasAttachments = Boolean(promptMessage.files?.length);

    if (!(hasText || hasAttachments) || loading) return;

    const userMessage =
      promptMessage.text?.trim() || "Sent with attachments";

    // Add user message immediately
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userChatMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Use Cerebras API for UI generation
      const response = await fetch("/api/cerebras-ui-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          systemPrompt: systemPrompt,
          conversationHistory: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate component");
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let assistantMessageId = `assistant-${Date.now()}`;

      // Add initial assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
        },
      ]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullText += chunk;

        // Update assistant message with streaming content
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].id === assistantMessageId) {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: fullText,
            };
          }
          return updated;
        });
      }

      // Extract and validate code
      const extracted = extractReactCode(fullText);
      if (extracted && extracted.isValid) {
        setGeneratedCode(extracted.code);

        // Create CodeSandbox URL for preview
        const sandboxUrl = createCodeSandboxUrl(extracted.code);
        setPreviewUrl(sandboxUrl);

        // Validate code quality
        const validation = validateCode(extracted.code);
        if (validation.warnings.length > 0) {
          console.warn("Code warnings:", validation.warnings);
        }
      } else {
        setError(
          "Generated response doesn't contain valid React code. Please try rephrasing your request."
        );
      }
    } catch (err: any) {
      console.error("Error generating component:", err);
      setError(err.message || "Failed to generate component");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
    setPreviewUrl(null);
    setError(null);
    void fetchSavedChats();
  };

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className={cn("flex h-full", className)}>
      {/* Chat Panel */}
      <div className="flex w-1/2 flex-col border-r bg-background">
        {/* Header */}
        <div className="border-b p-3 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <h1 className="text-lg font-semibold">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              New Chat
            </Button>
          )}
        </div>

        {/* Saved Chats Section */}
        {status === "authenticated" && savedChats.length > 0 && (
          <div className="border-b bg-muted/50 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Recent Chats
              </h3>
              {(loadingSavedChats || loadingChatDetail) && <Loader />}
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {savedChats.slice(0, 5).map((chat) => (
                <Button
                  key={chat.id}
                  variant={chatId === chat.id ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => loadChat(chat.id)}
                  disabled={loadingChatDetail && chatId === chat.id}
                >
                  {chat.title}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <div className="mb-8">
                {icon && (
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                    {icon}
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{emptyStateTitle}</h3>
                <p className="text-muted-foreground max-w-md">
                  {emptyStateDescription}
                </p>
              </div>
              <Suggestions>
                {examplePrompts.map((prompt, i) => (
                  <Suggestion
                    key={i}
                    onClick={() => setInput(prompt)}
                    suggestion={prompt}
                  />
                ))}
              </Suggestions>
            </div>
          ) : (
            <>
              <Conversation>
                <ConversationContent>
                  {messages.map((message) => (
                    <Message key={message.id} from={message.role}>
                      <MessageContent>{message.content}</MessageContent>
                    </Message>
                  ))}
                </ConversationContent>
              </Conversation>
              {loading && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2">
                      <Loader />
                      Creating your content...
                    </div>
                  </MessageContent>
                </Message>
              )}
              {loadingChatDetail && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2">
                      <Loader />
                      Loading chat...
                    </div>
                  </MessageContent>
                </Message>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <PromptInput
            onSubmit={handleSubmit}
            className="w-full max-w-2xl mx-auto relative"
          >
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              className="pr-12 min-h-[60px]"
              placeholder="Describe what you want to create..."
            />
            <PromptInputSubmit
              className="absolute bottom-2 right-2"
              disabled={!input.trim()}
              status={loading ? "streaming" : "ready"}
            />
          </PromptInput>
          {session?.user && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Signed in as {session.user.email}
            </p>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 flex flex-col bg-muted/30">
        {/* Header with actions */}
        <div className="border-b p-4 bg-background flex items-center justify-between">
          <h3 className="font-semibold">Generated Code</h3>
          {generatedCode && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const success = await copyToClipboard(generatedCode);
                  if (success) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
              {previewUrl && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.open(previewUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in CodeSandbox
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Code display or empty state */}
        <div className="flex-1 overflow-auto">
          {generatedCode ? (
            <SyntaxHighlighter
              language="typescript"
              style={vscDarkPlus}
              showLineNumbers
              customStyle={{
                margin: 0,
                height: "100%",
                fontSize: "14px",
              }}
            >
              {generatedCode}
            </SyntaxHighlighter>
          ) : (
            <div className="flex h-full items-center justify-center text-center p-8">
              <div className="space-y-2 max-w-sm">
                {icon && (
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    {icon}
                  </div>
                )}
                <p className="text-lg font-medium">
                  Your generated code will appear here
                </p>
                <p className="text-sm text-muted-foreground">
                  Describe what you want to build and I'll generate React +
                  Tailwind code for you
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
