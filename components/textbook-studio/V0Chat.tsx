"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, SendIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
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

function normalizeMessageContent(content: any): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          if ("text" in item && typeof item.text === "string") {
            return item.text;
          }
          if ("content" in item && typeof item.content === "string") {
            return item.content;
          }
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
    if ("text" in content && typeof content.text === "string") {
      return content.text;
    }
    if ("content" in content && typeof content.content === "string") {
      return content.content;
    }
  }

  if (content == null) {
    return "";
  }

  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}

function transformApiMessages(apiMessages: any[]): Message[] {
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
        typeof msg.createdAt === "string" ? msg.createdAt : new Date().toISOString(),
    }))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

interface V0ChatProps {
  className?: string;
}

export function V0Chat({ className }: V0ChatProps) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [loadingSavedChats, setLoadingSavedChats] = useState(false);
  const [loadingChatDetail, setLoadingChatDetail] = useState(false);
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

      // Sort newest first by updatedAt if available
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
      if (!targetChatId || loadingChatDetail) {
        return;
      }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      let endpoint: string;
      let body: any;

      if (chatId) {
        // Continue existing chat
        endpoint = `/api/textbook-studio/chats/${chatId}`;
        body = { message: input };
      } else {
        // Create new chat with educational system prompt
        endpoint = "/api/textbook-studio/chats";
        body = {
          message: input,
          system: "You are an expert educational content creator specializing in creating comprehensive textbook materials. Create well-structured content with clear explanations, examples, diagrams, and visual aids.",
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Update chat ID if this was a new chat
      const chatData = data.chat || data.response;
      if (!chatId && chatData?.id) {
        setChatId(chatData.id);
      }

      // Update preview URL if available
      if (chatData?.demo || chatData?.previewUrl) {
        setPreviewUrl(chatData.demo || chatData.previewUrl);
      }

      // Add assistant messages from the response
      const chatMessages = transformApiMessages(chatData?.messages || []);
      const assistantMessages = chatMessages.filter(
        (msg) => msg.role === "assistant"
      );

      if (assistantMessages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id));
          const newMessages = assistantMessages.filter(
            (msg) => !existingIds.has(msg.id)
          );
          return newMessages.length > 0 ? [...prev, ...newMessages] : prev;
        });
      }

      // Refresh saved chats to include the new or updated chat
      void fetchSavedChats();
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
    setPreviewUrl(null);
    setError(null);
    // Refresh saved chats so ordering reflects activity
    void fetchSavedChats();
  };

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("flex h-full", className)}>
      {/* Chat Panel */}
      <div className="flex w-1/2 flex-col border-r">
        {/* Chat Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Textbook Studio</h2>
              <p className="text-sm text-muted-foreground">
                {session?.user?.email || "Anonymous User"}
              </p>
            </div>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleNewChat}>
                New Chat
              </Button>
            )}
          </div>
        </div>

        {status === "authenticated" && (
          <div className="border-b bg-muted/50 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Saved Chats
              </h3>
              {(loadingSavedChats || loadingChatDetail) && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {savedChats.length > 0 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {savedChats.map((chat) => (
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
            ) : (
              !loadingSavedChats && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Start a conversation to see it saved here.
                </p>
              )
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-bold mb-4">
                Welcome to Textbook Studio
              </h3>
              <p className="text-muted-foreground max-w-md mb-8">
                Create comprehensive educational content with AI. Generate
                textbook chapters, exercises, diagrams, and more.
              </p>
              <div className="grid gap-2 w-full max-w-md">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() =>
                    setInput("Create a textbook chapter on photosynthesis")
                  }
                >
                  Create a textbook chapter on photosynthesis
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() =>
                    setInput(
                      "Generate practice exercises for algebra equations"
                    )
                  }
                >
                  Generate practice exercises for algebra
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() =>
                    setInput("Create a study guide for World War II")
                  }
                >
                  Create a study guide for World War II
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-2xl p-4",
                    message.role === "user"
                      ? "ml-auto max-w-[80%] bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating content...
                </div>
              )}
              {loadingChatDetail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading saved chat...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you want to create..."
              disabled={loading || loadingChatDetail}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || loadingChatDetail || !input.trim()}
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex w-1/2 flex-col bg-muted/30">
        <div className="border-b p-4">
          <h3 className="font-semibold">Preview</h3>
        </div>
        <div className="flex-1 overflow-hidden">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="h-full w-full border-0"
              title="Preview"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center p-8">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Your generated content will appear here
                </p>
                <p className="text-sm text-muted-foreground">
                  Start a conversation to see the preview
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
