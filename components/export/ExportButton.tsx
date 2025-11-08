'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, FilePresentation } from 'lucide-react';
import { ExportDialog } from './ExportDialog';

interface ExportContent {
  title: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

interface ExportButtonProps {
  content: ExportContent;
  defaultFilename?: string;
  className?: string;
  variant?: 'default' | 'secondary' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function ExportButton({
  content,
  defaultFilename = 'export',
  className,
  variant = 'outline',
  size = 'default',
}: ExportButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            title="Export this content"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowDialog(true)}>
            <FileText className="w-4 h-4 mr-2" />
            <span>PDF Document</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDialog(true)}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            <span>Excel Spreadsheet</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDialog(true)}>
            <FilePresentation className="w-4 h-4 mr-2" />
            <span>PowerPoint Presentation</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        content={content}
        defaultFilename={defaultFilename}
      />
    </>
  );
}
