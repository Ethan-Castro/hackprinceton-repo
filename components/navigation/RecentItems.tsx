'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface RecentItem {
  id: string;
  title: string;
  path: string;
  category: 'health' | 'business' | 'education' | 'sustainability' | 'playground';
  timestamp: number;
}

export function useRecentItems() {
  const [items, setItems] = useState<RecentItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentItems');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent items:', e);
      }
    }
  }, []);

  // Add a recent item
  const addItem = (item: Omit<RecentItem, 'timestamp'>) => {
    setItems((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((i) => i.path !== item.path);
      // Add new item at the beginning
      const updated = [
        { ...item, timestamp: Date.now() },
        ...filtered.slice(0, 9), // Keep only 10 items
      ];
      // Save to localStorage
      localStorage.setItem('recentItems', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (path: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.path !== path);
      localStorage.setItem('recentItems', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    setItems([]);
    localStorage.removeItem('recentItems');
  };

  return { items, addItem, removeItem, clearAll };
}

interface RecentItemsProps {
  items: RecentItem[];
  onRemove?: (path: string) => void;
  onClearAll?: () => void;
}

export function RecentItems({ items, onRemove, onClearAll }: RecentItemsProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No recent items</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase">
          Recent
        </h3>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-auto py-1 px-2"
            onClick={onClearAll}
          >
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="h-[200px]">
        <div className="space-y-1 pr-4">
          {items.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted group transition-colors text-sm"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate text-muted-foreground group-hover:text-foreground">
                  {item.title}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onRemove?.(item.path);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
