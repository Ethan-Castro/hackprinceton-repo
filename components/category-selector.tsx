"use client";

import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { memo } from "react";

type CategorySelectorProps = {
  category: string;
  onCategoryChange: (category: string) => void;
};

const CATEGORIES = [
  { id: "edu", label: "EDU" },
  { id: "biz", label: "BIZ" },
  { id: "health", label: "HEALTH" },
  { id: "sustainability", label: "SUSTAINABILITY" },
] as const;

export const CategorySelector = memo(function CategorySelector({
  category,
  onCategoryChange,
}: CategorySelectorProps) {
  return (
    <Select value={category} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-9 h-9 md:w-[140px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:outline-none focus:border-0 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl font-medium text-sm p-0 md:px-3 [&_[data-placeholder]]:hidden md:[&_[data-placeholder]]:block [&>svg]:hidden md:[&>svg]:block">
        <div className="flex items-center justify-center w-full h-full md:hidden">
          <ChevronDown className="h-4 w-4" />
        </div>
        <div className="hidden md:flex items-center gap-2 w-full">
          <SelectValue placeholder="Category" />
        </div>
      </SelectTrigger>

      <SelectContent
        className="rounded-2xl border-0 shadow-border-medium bg-popover/95 backdrop-blur-sm animate-scale-in"
        align="start"
        sideOffset={4}
      >
        <SelectGroup>
          <SelectLabel className="text-xs text-muted-foreground px-2 py-1 transition-colors duration-150">
            Category
          </SelectLabel>
          {CATEGORIES.map((cat) => (
            <SelectItem
              key={cat.id}
              value={cat.id}
              className="rounded-lg hover:bg-accent/50 cursor-pointer"
            >
              {cat.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
});
