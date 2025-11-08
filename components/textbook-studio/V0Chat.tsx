"use client";

import { useState, useEffect, useRef } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      if (chatData?.demo) {
        setPreviewUrl(chatData.demo);
      }

      // Add assistant messages from the response
      const chatMessages = chatData?.messages || [];
      const assistantMessages = chatMessages
        .filter((msg: any) => msg.role === "assistant")
        .map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        }));

      if (assistantMessages.length > 0) {
        setMessages((prev) => [...prev, ...assistantMessages]);
      }
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
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
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
