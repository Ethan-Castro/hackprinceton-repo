"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy, ExternalLink, Check, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createCodeSandboxUrl,
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
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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

export interface ThemedV0ChatProps {
  className?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  examplePrompts: string[];
  systemPrompt?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  placeholder?: string;
  primaryColor?: string; // New prop for color theming
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

export function ThemedV0Chat({
  className,
  title,
  subtitle,
  badge = "Studio OS",
  icon,
  examplePrompts,
  systemPrompt,
  emptyStateTitle = "What can we build together?",
  emptyStateDescription = "Describe what you want to create, and I'll generate it for you.",
  placeholder = "Describe what you want to create...",
  primaryColor = "hsl(var(--primary))", // Default to primary if not provided
}: ThemedV0ChatProps) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [loadingSavedChats, setLoadingSavedChats] = useState(false);
  const [loadingChatDetail, setLoadingChatDetail] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derived colors
  const glowColor = primaryColor;

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
        const loadedFiles = Array.isArray(chatData.files) ? chatData.files : [];
        const loadedMainFile =
          loadedFiles.find(
            (f: any) =>
              typeof f?.name === "string" &&
              (f.name.includes("App") ||
                f.name.includes("page") ||
                f.name.includes("index"))
          ) || loadedFiles[0];

        if (chatData.demo || chatData.previewUrl) {
          setPreviewUrl(chatData.demo || chatData.previewUrl || null);
        } else {
          const matchedChat = savedChats.find(
            (chat) => chat.id === targetChatId
          );
          setPreviewUrl(matchedChat?.previewUrl || null);
        }
        setPreviewHtml(
          loadedMainFile?.content && typeof loadedMainFile.content === "string"
            ? loadedMainFile.content
            : null
        );
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
      const response = await fetch("/api/v0-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chatId: chatId,
          system: !chatId ? systemPrompt : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to generate component");
      }

      const data = await response.json();

      if (!chatId && data.id) {
        setChatId(data.id);
      }

      if (data.demo) {
        setPreviewUrl(data.demo);
      }

      if (data.files && data.files.length > 0) {
        const mainFile = data.files.find((f: any) => 
          f.name?.includes('App') || f.name?.includes('page') || f.name?.includes('index')
        ) || data.files[0];
        
        if (mainFile?.content) {
          setGeneratedCode(mainFile.content);
          // Don't set previewHtml when we have a previewUrl - the URL will handle rendering
          // Only set previewHtml if there's no demo URL (fallback for inline rendering)
          if (!data.demo) {
            setPreviewHtml(mainFile.content);
          }
        }
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "Generated new app preview. Check the preview panel!",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate component";
      setError(errorMessage);
      
      const errorChatMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: `Sorry, there was an error: ${errorMessage}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
    setPreviewUrl(null);
    setPreviewHtml(null);
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
    <div className={cn("flex h-full bg-background", className)}>
      {/* Chat Panel - Improved UI */}
      <div className="flex w-1/2 flex-col border-r bg-background/50 backdrop-blur-xl relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
           <div 
            className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full blur-3xl opacity-10 transition-colors duration-500"
            style={{ backgroundColor: glowColor }}
           />
           <div 
            className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full blur-3xl opacity-10 transition-colors duration-500"
            style={{ backgroundColor: glowColor }}
           />
        </div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 p-6 pb-2 flex items-start justify-between"
        >
          <div className="space-y-2">
             <Badge variant="outline" className="px-3 py-0.5 text-xs tracking-widest uppercase rounded-full border-primary/20 text-primary/80 mb-2">
                {badge}
             </Badge>
             <h1 className="text-3xl font-light tracking-tighter text-foreground">
                {title} <span className="font-serif italic text-muted-foreground">{subtitle?.split(' ')[0]}</span>
             </h1>
             <p className="text-sm text-muted-foreground font-light max-w-[300px] leading-relaxed">
                {subtitle}
             </p>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleNewChat} className="rounded-full border-dashed">
              New Session
            </Button>
          )}
        </motion.div>

        {/* Saved Chats Section */}
        {status === "authenticated" && savedChats.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 px-6 py-4"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {savedChats.slice(0, 5).map((chat) => (
                <Button
                  key={chat.id}
                  variant={chatId === chat.id ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "whitespace-nowrap rounded-full text-xs font-light tracking-wide",
                    chatId === chat.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => loadChat(chat.id)}
                  disabled={loadingChatDetail && chatId === chat.id}
                >
                  {chat.title}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages Area */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex h-full flex-col items-center justify-center text-center"
            >
              <div className="mb-10 space-y-6 max-w-md">
                <div 
                  className="mx-auto w-20 h-20 rounded-full border border-dashed border-primary/20 flex items-center justify-center transition-colors duration-500"
                  style={{ 
                    background: `linear-gradient(135deg, ${glowColor}10, transparent)` 
                  }}
                >
                  <Sparkles 
                    className="h-8 w-8 transition-colors duration-500" 
                    style={{ color: glowColor }}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-light tracking-tight mb-3">{emptyStateTitle}</h3>
                  <p className="text-muted-foreground font-serif italic">
                    {emptyStateDescription}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                {examplePrompts.map((prompt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInput(prompt)}
                    className="text-left p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-muted-foreground group-hover:text-foreground transition-colors">
                        {prompt}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6 pb-4">
               {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4 max-w-3xl",
                      message.role === "user" ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors duration-300",
                        message.role === "user" ? "text-white" : "bg-muted border border-border"
                      )}
                      style={message.role === "user" ? { backgroundColor: glowColor } : {}}
                    >
                      {message.role === "user" ? "U" : "AI"}
                    </div>
                    <div className={cn(
                      "rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                      message.role === "user" 
                        ? "bg-primary/5 text-foreground rounded-tr-none" 
                        : "bg-card border border-border/50 rounded-tl-none"
                    )}>
                      {message.content}
                    </div>
                  </motion.div>
               ))}
               {(loading || loadingChatDetail) && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex gap-4"
                 >
                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                      <Loader className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-none p-4 bg-card border border-border/50 text-sm text-muted-foreground">
                      Thinking...
                    </div>
                 </motion.div>
               )}
               <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="relative z-10 p-6 border-t bg-background/50 backdrop-blur-md">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="relative group">
            <div 
              className="absolute -inset-0.5 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" 
              style={{ 
                background: `linear-gradient(to right, ${glowColor}40, ${glowColor}20)` 
              }}
            />
            <div className="relative bg-background rounded-xl border shadow-sm">
               <PromptInputTextarea
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  className="w-full min-h-[80px] p-4 bg-transparent border-none resize-none focus:ring-0 text-base font-light placeholder:text-muted-foreground/50"
                  placeholder={placeholder}
                />
                <div className="flex justify-between items-center p-2 pl-4 border-t border-border/30 bg-muted/10 rounded-b-xl">
                  <span className="text-xs text-muted-foreground font-mono">
                    {session?.user?.email || "Guest Mode"}
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => handleSubmit({ text: input, files: [] })}
                    disabled={!input.trim() || loading}
                    className="rounded-lg h-8 px-4 transition-all duration-300 border-none text-white"
                    style={{ backgroundColor: !input.trim() || loading ? undefined : glowColor }}
                  >
                    {loading ? <Loader className="mr-2 h-3 w-3" /> : <Sparkles className="mr-2 h-3 w-3" />}
                    Generate
                  </Button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 flex flex-col bg-muted/10 relative">
         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
        <WebPreview>
          <WebPreviewNavigation className="border-b border-border/50 bg-background/50 backdrop-blur-sm px-4 py-2">
            <WebPreviewUrl
              readOnly
              placeholder="Preview will appear here..."
              value={previewUrl || ""}
              className="bg-muted/30 border-transparent hover:border-border/50 transition-colors"
            />
            {previewUrl && (
              <div className="flex gap-2 ml-auto">
                {generatedCode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const success = await copyToClipboard(generatedCode);
                      if (success) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="h-8"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(previewUrl, "_blank")}
                  className="h-8"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}
          </WebPreviewNavigation>
          <WebPreviewBody
            src={previewUrl || undefined}
            srcDoc={previewHtml || undefined}
            className="bg-background shadow-2xl m-4 rounded-xl border border-border/50 overflow-hidden"
          />
        </WebPreview>
      </div>
    </div>
  );
}
