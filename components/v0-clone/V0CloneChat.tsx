"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, SendIcon, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { extractReactCode, createCodeSandboxUrl } from "@/lib/extract-code";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface V0CloneChatProps {
  className?: string;
}

export function V0CloneChat({ className }: V0CloneChatProps) {
  const { data: session } = useSession();
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
      // Use Cerebras GPT-OSS-120B for UI generation (free & fast)
      console.log("[V0 Clone] Sending request to GPT-OSS-120B...");
      
      const response = await fetch("/api/cerebras-ui-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages
            .slice(-4) // Keep last 2 exchanges for context
            .map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[V0 Clone] API Error:", errorText);
        throw new Error("Failed to generate UI");
      }

      // Stream the response
      console.log("[V0 Clone] Streaming response...");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let generatedCode = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          generatedCode += chunk;
        }
      }

      console.log("[V0 Clone] Generated code length:", generatedCode.length);
      console.log("[V0 Clone] First 200 chars:", generatedCode.substring(0, 200));

      // Extract React code from the response
      const extractedCode = extractReactCode(generatedCode);
      console.log("[V0 Clone] Extracted code:", extractedCode ? `${(extractedCode as any).length || 'object'} chars` : "null");
      
      if (extractedCode) {
        // Generate CodeSandbox preview URL
        console.log("[V0 Clone] Creating CodeSandbox URL...");
        try {
          const codeString = typeof extractedCode === 'string' ? extractedCode : (extractedCode as any).code || '';
          const sandboxUrl = createCodeSandboxUrl(codeString);
          console.log("[V0 Clone] CodeSandbox URL:", sandboxUrl);
          setPreviewUrl(sandboxUrl);

          // Add assistant response with code preview
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: `✨ **Generated with GPT-OSS-120B**\n\nYour UI is ready! Check the live preview on the right →\n\n<details>\n<summary>📝 View Source Code (${codeString.length} chars)</summary>\n\n\`\`\`tsx\n${codeString}\n\`\`\`\n</details>`,
            createdAt: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
        } catch (urlError) {
          console.error("[V0 Clone] CodeSandbox URL Error:", urlError);
          throw new Error("Failed to create preview URL");
        }
      } else {
        console.warn("[V0 Clone] No code extracted from response");
        
        // No code found, show the raw response
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `⚠️ Could not extract code from response.\n\n**Raw Response:**\n\n${generatedCode.substring(0, 1000)}${generatedCode.length > 1000 ? "..." : ""}`,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
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

  const examplePrompts = [
    "A landing page for a SaaS startup",
    "A todo app with drag and drop",
    "A pricing page with three tiers",
    "A dashboard with charts and stats",
  ];

  return (
    <div className={cn("flex h-full", className)}>
      {/* Chat Panel */}
      <div className="flex w-1/2 flex-col border-r bg-background">
        {/* Chat Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">v0</h2>
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
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <div className="mb-8">
                <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">
                  What can I help you build?
                </h3>
                <p className="text-muted-foreground">
                  Describe a UI, and I&apos;ll generate the code for you
                </p>
              </div>
              <div className="grid gap-2 w-full max-w-md">
                {examplePrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="justify-start text-left h-auto py-3"
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-lg p-4",
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
                  Generating...
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
              placeholder="Describe the UI you want to build..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <SendIcon className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            {session?.user
              ? `Signed in as ${session.user.email}`
              : "Continue as anonymous user"}
          </p>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex w-1/2 flex-col bg-muted/30">
        <div className="border-b p-4 bg-background">
          <h3 className="font-semibold">Preview</h3>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="absolute inset-0 h-full w-full border-0"
              title="Preview"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center p-8">
              <div className="space-y-2 max-w-sm">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">Your UI will appear here</p>
                <p className="text-sm text-muted-foreground">
                  Start by describing what you want to build
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
