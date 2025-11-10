'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Loader2, FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { downloadPdf } from '@/lib/export/pdf';
import { downloadExcel } from '@/lib/export/excel';
import { downloadPowerPoint } from '@/lib/export/powerpoint';
import toast from 'react-hot-toast';

interface ExportContent {
  title: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ExportContent;
  defaultFilename?: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  content,
  defaultFilename = 'export',
}: ExportDialogProps) {
  const [format, setFormat] = useState<'pdf' | 'excel' | 'powerpoint'>('pdf');
  const [filename, setFilename] = useState(defaultFilename);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const sanitizedFilename = filename
        .replace(/[^a-z0-9-_]/gi, '-')
        .toLowerCase();

      switch (format) {
        case 'pdf':
          await downloadPdf(content, `${sanitizedFilename}.pdf`, {
            title: content.title,
          });
          break;

        case 'excel':
          await downloadExcel(
            {
              title: content.title,
              sheets: [
                {
                  name: 'Content',
                  headers: ['Section', 'Content'],
                  rows: content.sections.map((s) => [s.title, s.content]),
                  columnWidths: [25, 50],
                },
              ],
            },
            `${sanitizedFilename}.xlsx`
          );
          break;

        case 'powerpoint':
          await downloadPowerPoint(
            {
              title: content.title,
              slides: [
                {
                  title: content.title,
                  type: 'title',
                  content: 'Generated Presentation',
                },
                ...content.sections.map((section) => ({
                  title: section.title,
                  type: 'content' as const,
                  content: section.content.split('\n').filter(Boolean),
                })),
              ],
            },
            `${sanitizedFilename}.pptx`,
            { theme: 'blue' }
          );
          break;
      }

      toast.success(`Exported as ${format.toUpperCase()}`);
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export file');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
          <DialogDescription>
            Choose a format and filename for your export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as any)}>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">PDF</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Professional document format, ideal for sharing and printing
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="font-medium">Excel</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Spreadsheet format, great for data analysis and manipulation
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <RadioGroupItem value="powerpoint" id="powerpoint" />
                <Label htmlFor="powerpoint" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Presentation className="w-4 h-4" />
                    <span className="font-medium">PowerPoint</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Presentation format, perfect for presentations and pitches
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <div className="flex items-center gap-2">
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Enter filename"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">
                .
                {format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'pptx'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Special characters will be replaced with hyphens
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting || !filename.trim()}>
              {isExporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
