'use client';

import { Template, getTemplatesByCategory, searchTemplates } from '@/lib/templates/registry';
import { TemplateCard } from './TemplateCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
  category?: 'business' | 'education' | 'health';
}

export function TemplateGallery({ onSelectTemplate, category }: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'business' | 'education' | 'health' | null>(
    category || null
  );

  const templates = searchQuery
    ? searchTemplates(searchQuery)
    : selectedCategory
      ? getTemplatesByCategory(selectedCategory)
      : [];

  // If no category selected and no search, show category selector
  if (!selectedCategory && !searchQuery) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
          <p className="text-muted-foreground">
            Start with a template designed for your use case
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CategoryButton
            label="Business"
            icon="💼"
            description="Business plans, pitch decks, financial projections"
            onClick={() => setSelectedCategory('business')}
          />
          <CategoryButton
            label="Education"
            icon="📚"
            description="Courses, curricula, study materials"
            onClick={() => setSelectedCategory('education')}
          />
          <CategoryButton
            label="Health"
            icon="🏥"
            description="Fitness plans, meal plans, wellness programs"
            onClick={() => setSelectedCategory('health')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Search'}{' '}
            Templates
          </h2>
          <p className="text-muted-foreground">
            Select a template to get started
          </p>
        </div>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
            }}
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelectTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoryButtonProps {
  label: string;
  icon: string;
  description: string;
  onClick: () => void;
}

function CategoryButton({ label, icon, description, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-6 rounded-lg border-2 border-transparent hover:border-primary transition-all text-left',
        'bg-card hover:bg-muted'
      )}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-1">{label}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
}
