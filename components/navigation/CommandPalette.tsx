'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Settings,
  HelpCircle,
  LogOut,
  MessageSquare,
  Zap,
  Home,
  BarChart3,
  BookOpen,
  Leaf,
  Search,
  Network,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  group: 'navigation' | 'actions' | 'templates' | 'settings';
  action: () => void;
  isActive?: boolean;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const selectedTheme = theme ?? 'system';
  const currentVisualTheme = resolvedTheme ?? 'light';

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-4 h-4" />,
      group: 'navigation',
      action: () => {
        router.push('/');
        setOpen(false);
      },
    },
    {
      id: 'health',
      label: 'Health Coach',
      description: 'AI-powered health guidance',
      icon: <MessageSquare className="w-4 h-4" />,
      group: 'navigation',
      action: () => {
        router.push('/health');
        setOpen(false);
      },
    },
    {
      id: 'business',
      label: 'Business Assistant',
      description: 'Business planning and analysis',
      icon: <BarChart3 className="w-4 h-4" />,
      group: 'navigation',
      action: () => {
        router.push('/business');
        setOpen(false);
      },
    },
    {
      id: 'education',
      label: 'Education Studio',
      description: 'Interactive learning',
      icon: <BookOpen className="w-4 h-4" />,
      group: 'navigation',
      action: () => {
        router.push('/education');
        setOpen(false);
      },
    },
    {
      id: 'sustainability',
      label: 'Sustainability Hub',
      description: 'Environmental insights',
      icon: <Leaf className="w-4 h-4" />,
      group: 'navigation',
      action: () => {
        router.push('/sustainability');
        setOpen(false);
      },
    },
    {
      id: 'workflow',
      label: 'Workflows',
      description: 'Workflow visualizations and integration patterns',
      icon: <Network className="w-4 h-4" />,
      group: 'navigation',
      action: () => {
        router.push('/workflow');
        setOpen(false);
      },
    },

    // Actions
    {
      id: 'new-chat',
      label: 'New Chat',
      description: 'Start a new conversation',
      shortcut: 'Cmd+N',
      icon: <Plus className="w-4 h-4" />,
      group: 'actions',
      action: () => {
        router.push('/health');
        setOpen(false);
      },
    },
    {
      id: 'new-template',
      label: 'New from Template',
      description: 'Start with a template',
      icon: <FileText className="w-4 h-4" />,
      group: 'actions',
      action: () => {
        // This will be handled by the chat component
        setOpen(false);
      },
    },

    // Settings
    {
      id: 'settings',
      label: 'Settings',
      description: 'User preferences',
      icon: <Settings className="w-4 h-4" />,
      group: 'settings',
      action: () => {
        router.push('/settings');
        setOpen(false);
      },
    },
    {
      id: 'theme-toggle',
      label: currentVisualTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle the color theme across the app',
      shortcut: 'Cmd+Shift+L',
      icon: currentVisualTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      group: 'settings',
      action: () => {
        setTheme(currentVisualTheme === 'dark' ? 'light' : 'dark');
        setOpen(false);
      },
    },
    {
      id: 'theme-light',
      label: 'Light Mode',
      description: selectedTheme === 'light' ? 'Currently active' : 'Use light theme on every page',
      icon: <Sun className="w-4 h-4" />,
      group: 'settings',
      action: () => {
        setTheme('light');
        setOpen(false);
      },
      isActive: selectedTheme === 'light',
    },
    {
      id: 'theme-dark',
      label: 'Dark Mode',
      description: selectedTheme === 'dark' ? 'Currently active' : 'Use dark theme on every page',
      icon: <Moon className="w-4 h-4" />,
      group: 'settings',
      action: () => {
        setTheme('dark');
        setOpen(false);
      },
      isActive: selectedTheme === 'dark',
    },
    {
      id: 'theme-system',
      label: 'System Theme',
      description: selectedTheme === 'system' ? 'Following device preference' : 'Match your OS appearance',
      icon: <Monitor className="w-4 h-4" />,
      group: 'settings',
      action: () => {
        setTheme('system');
        setOpen(false);
      },
      isActive: selectedTheme === 'system',
    },
    {
      id: 'help',
      label: 'Help & Support',
      description: 'Documentation and support',
      icon: <HelpCircle className="w-4 h-4" />,
      group: 'settings',
      action: () => {
        router.push('/help');
        setOpen(false);
      },
    },
  ];

  // Group commands
  const groupedCommands = commands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.group]) acc[cmd.group] = [];
      acc[cmd.group].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  // Filter commands based on search
  const filteredCommands = searchValue
    ? commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(searchValue.toLowerCase())
      )
    : [];

  // Toggle command palette with Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }

      // Cmd+N for new chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        // Trigger new chat
      }

      // Escape to close
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command
          className="[&_[cmdk-input]]:h-12"
          shouldFilter={false}
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search commands, pages, templates..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {searchValue ? (
              // Show search results
              <div className="overflow-hidden p-1 text-foreground">
                {filteredCommands.length === 0 ? (
                  <div className="py-6 text-center text-sm">
                    No results found for &ldquo;{searchValue}&rdquo;
                  </div>
                ) : (
                  <>
                    {filteredCommands.map((cmd) => (
                      <CommandItem
                        key={cmd.id}
                        cmd={cmd}
                      />
                    ))}
                  </>
                )}
              </div>
            ) : (
              // Show grouped commands
              <div className="overflow-hidden p-1 text-foreground">
                {Object.entries(groupedCommands).map(([group, items]) => (
                  <div key={group}>
                    <div className="overflow-hidden p-1">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {group === 'navigation' && 'Navigate'}
                        {group === 'actions' && 'Quick Actions'}
                        {group === 'templates' && 'Templates'}
                        {group === 'settings' && 'Settings'}
                      </div>
                      {items.map((cmd) => (
                        <CommandItem key={cmd.id} cmd={cmd} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t px-2 py-2 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <kbd className="rounded border bg-muted px-1 py-0.5">Cmd</kbd>
              <kbd className="rounded border bg-muted px-1 py-0.5">K</kbd>
              <span>to open</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

interface CommandItemProps {
  cmd: CommandItem;
}

function CommandItem({ cmd }: CommandItemProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <button
      onClick={cmd.action}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        'relative flex w-full select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none cursor-pointer border border-transparent',
        isHovering ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground',
        cmd.isActive && 'border-primary/40 bg-primary/5'
      )}
    >
      <div className="mr-2 flex h-4 w-4 items-center justify-center">
        {cmd.icon}
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium">{cmd.label}</div>
        {cmd.description && (
          <div className="text-xs text-muted-foreground">{cmd.description}</div>
        )}
      </div>
      {cmd.shortcut && (
        <div className="text-xs text-muted-foreground">
          <kbd className="rounded border border-muted bg-muted px-1.5 py-0.5">
            {cmd.shortcut}
          </kbd>
        </div>
      )}
    </button>
  );
}
