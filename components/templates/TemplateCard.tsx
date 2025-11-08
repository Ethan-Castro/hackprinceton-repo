'use client';

import { Template } from '@/lib/templates/engine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const requiredCount = template.variables.filter((v) => v.required).length;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(template)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-3xl mb-2">{template.icon}</div>
            <CardTitle>{template.name}</CardTitle>
            <CardDescription className="mt-2">{template.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <div className="flex justify-between py-1">
            <span>Sections:</span>
            <span className="font-semibold">{template.sections.length}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Fields to fill:</span>
            <span className="font-semibold">{requiredCount}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Est. time:</span>
            <span className="font-semibold">{template.sections.length * 2} min</span>
          </div>
        </div>

        <Button className="w-full gap-2" onClick={(e) => {
          e.stopPropagation();
          onSelect(template);
        }}>
          Use Template
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
