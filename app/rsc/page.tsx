'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Streaming Chat Interface
 *
 * This page demonstrates streaming capabilities for:
 * - Real-time text generation
 * - Business analysis with structured data
 * - Interactive multi-step workflows
 *
 * Note: This uses core AI SDK streaming (streamText, generateObject)
 * without @ai-sdk/rsc dependency, making it more compatible with
 * the existing project setup.
 */

type ChatMode = 'general' | 'business' | 'analysis';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'structured';
}

export default function StreamingChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('general');
  const [modelId, setModelId] = useState('claude-3-5-sonnet-20241022');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = input;
    setInput('');

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        type: 'text',
      },
    ]);

    try {
      // Stream response from API
      const response = await fetch('/api/streaming-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          modelId,
          chatMode,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let content = '';
      const decoder = new TextDecoder();

      // Add empty assistant message
      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          type: 'text',
        },
      ]);

      // Read stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        content += text;

        // Update assistant message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content } : msg
          )
        );
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Error: ${error.message}`,
          type: 'text',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card/80 backdrop-blur-sm p-4 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-6">Streaming Chat</h1>

        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide">
            CHAT MODE
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => setChatMode('general')}
              type="button"
              className={`w-full text-left px-3 py-2 rounded-md transition border border-transparent ${
                chatMode === 'general'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              General Chat
            </button>
            <button
              onClick={() => setChatMode('business')}
              type="button"
              className={`w-full text-left px-3 py-2 rounded-md transition border border-transparent ${
                chatMode === 'business'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Business Analyst
            </button>
            <button
              onClick={() => setChatMode('analysis')}
              type="button"
              className={`w-full text-left px-3 py-2 rounded-md transition border border-transparent ${
                chatMode === 'analysis'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Structured Analysis
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide">
            MODEL
          </h2>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm"
          >
            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
            <option value="claude-3-opus-20250219">Claude 3 Opus</option>
            <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground mt-8 space-y-1.5">
          <p className="mb-2 font-semibold">Features:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Real-time streaming</li>
            <li>Multiple chat modes</li>
            <li>Structured analysis</li>
            <li>Business tools</li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border p-4 shadow-sm">
          <h2 className="text-lg font-semibold">
            {chatMode === 'general' && 'General Chat'}
            {chatMode === 'business' && 'Business Analyst'}
            {chatMode === 'analysis' && 'Structured Analysis'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {chatMode === 'general' && 'Ask questions and get streaming responses'}
            {chatMode === 'business' && 'Business-specific analysis and insights'}
            {chatMode === 'analysis' && 'Generate structured business analyses'}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">Start a conversation</p>
                <p className="text-sm">Messages will stream in real-time</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`px-4 py-2 rounded-lg max-w-md whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-2 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-muted-foreground/70 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-muted-foreground/70 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-card border-t border-border p-4 shadow-lg">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
