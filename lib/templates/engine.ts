import { generateText } from 'ai';
import { gateway } from '@/lib/gateway';
import { z } from 'zod';

export interface TemplateVariable {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface TemplateSection {
  title: string;
  prompt: string;
  placeholders: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'education' | 'health';
  icon: string;
  variables: TemplateVariable[];
  sections: TemplateSection[];
  minVariablesFilled?: number;
}

export interface GeneratedContent {
  title: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  generatedFrom: string;
  generatedAt: string;
  variables: Record<string, string>;
}

export class TemplateEngine {
  /**
   * Interpolate template string with variables
   */
  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
  }

  /**
   * Generate content for a single section using AI
   */
  private async generateSectionContent(
    section: TemplateSection,
    variables: Record<string, string>
  ): Promise<string> {
    const prompt = this.interpolate(section.prompt, variables);

    // Validate API key before generating
    if (!process.env.AI_GATEWAY_API_KEY) {
      console.error(`AI_GATEWAY_API_KEY is required for template generation`);
      return `[Unable to generate content for ${section.title}: AI_GATEWAY_API_KEY is not configured]`;
    }

    try {
      const result = await generateText({
        model: gateway('anthropic/claude-sonnet-4.5'),
        prompt,
        temperature: 0.7,
      });

      return result.text;
    } catch (error) {
      console.error(`Failed to generate section "${section.title}":`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('API_KEY') || errorMessage.includes('authentication')) {
        return `[Unable to generate content for ${section.title}: API key configuration issue]`;
      }
      return `[Unable to generate content for ${section.title}]`;
    }
  }

  /**
   * Generate full content from template
   */
  async generateFromTemplate(
    template: Template,
    variables: Record<string, string>
  ): Promise<GeneratedContent> {
    const sections = [];

    for (const section of template.sections) {
      const content = await this.generateSectionContent(section, variables);
      sections.push({
        title: section.title,
        content,
      });
    }

    return {
      title: this.interpolate(`${template.name} - ${variables.companyName || variables.courseName || 'Untitled'}`, variables),
      sections,
      generatedFrom: template.id,
      generatedAt: new Date().toISOString(),
      variables,
    };
  }

  /**
   * Validate variables against template requirements
   */
  validateVariables(template: Template, variables: Record<string, string>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const varDef of template.variables) {
      if (varDef.required && !variables[varDef.id]) {
        errors.push(`"${varDef.label}" is required`);
      }

      if (varDef.type === 'number' && variables[varDef.id] && isNaN(Number(variables[varDef.id]))) {
        errors.push(`"${varDef.label}" must be a number`);
      }

      if (varDef.type === 'select' && varDef.options && variables[varDef.id] && !varDef.options.includes(variables[varDef.id])) {
        errors.push(`"${varDef.label}" must be one of: ${varDef.options.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get template metadata
   */
  getTemplateInfo(template: Template): {
    sectionCount: number;
    estimatedTime: number;
    requiredVariables: string[];
  } {
    const requiredVariables = template.variables
      .filter((v) => v.required)
      .map((v) => v.label);

    return {
      sectionCount: template.sections.length,
      estimatedTime: template.sections.length * 2, // Estimate 2 minutes per section
      requiredVariables,
    };
  }
}

export const templateEngine = new TemplateEngine();
