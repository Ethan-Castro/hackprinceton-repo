export type TemplateDocumentStatus = {
  label: string;
  state: "draft" | "in-progress" | "ready" | "archived";
  progress?: number;
  updatedAt?: string;
  eta?: string;
};

export type TemplateMetric = {
  label: string;
  value: string;
  helper?: string;
  trend?: "up" | "down";
};

export type TemplateResource = {
  title: string;
  description?: string;
  url?: string;
};

export type TemplateListItem = {
  title: string;
  detail?: string;
  badge?: string;
  icon?: string;
};

export type TemplateChecklistItem = {
  label: string;
  note?: string;
  checked?: boolean;
  due?: string;
};

export type TemplateTimelineStep = {
  title: string;
  detail?: string;
  timestamp?: string;
  status?: "done" | "current" | "pending";
};

export type TemplateBlock =
  | {
      type: "text";
      title?: string;
      body: string;
      variant?: "default" | "muted" | "quote";
      icon?: string;
    }
  | {
      type: "callout";
      title?: string;
      body: string;
      tone?: "info" | "success" | "warning" | "danger";
    }
  | {
      type: "list";
      title?: string;
      style?: "bullets" | "ordered" | "cards";
      items: TemplateListItem[];
    }
  | {
      type: "checklist";
      title?: string;
      items: TemplateChecklistItem[];
    }
  | {
      type: "timeline";
      title?: string;
      steps: TemplateTimelineStep[];
    }
  | {
      type: "metrics";
      title?: string;
      items: TemplateMetric[];
    }
  | {
      type: "resources";
      title?: string;
      items: TemplateResource[];
    }
  | {
      type: "quote";
      body: string;
      attribution?: string;
      icon?: string;
    };

export type TemplateSection = {
  id?: string;
  title: string;
  description?: string;
  layout?: "stack" | "grid" | "timeline";
  accent?: string;
  blocks: TemplateBlock[];
};

export type TemplateDocument = {
  id?: string;
  type: "textbook" | "health-protocol" | string;
  title: string;
  subtitle?: string;
  summary?: string;
  audience?: string;
  difficulty?: string;
  duration?: string;
  focusArea?: string;
  owner?: string;
  tags?: string[];
  status?: TemplateDocumentStatus;
  metrics?: TemplateMetric[];
  sections: TemplateSection[];
  resources?: TemplateResource[];
  exportedAt?: string;
};
