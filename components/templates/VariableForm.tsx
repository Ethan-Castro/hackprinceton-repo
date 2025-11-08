'use client';

import { Template, TemplateVariable } from '@/lib/templates/engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VariableFormProps {
  template: Template;
  onSubmit: (variables: Record<string, string>) => void;
  isLoading?: boolean;
}

export function VariableForm({ template, onSubmit, isLoading = false }: VariableFormProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (variableId: string, value: string) => {
    setVariables((prev) => ({
      ...prev,
      [variableId]: value,
    }));
    // Clear errors when user starts typing
    setErrors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const validationErrors: string[] = [];
    for (const varDef of template.variables) {
      if (varDef.required && !variables[varDef.id]) {
        validationErrors.push(`"${varDef.label}" is required`);
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(variables);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Fill in the details</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Provide information about your {template.category} to generate personalized content.
        </p>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {template.variables.map((variable) => (
          <VariableInput
            key={variable.id}
            variable={variable}
            value={variables[variable.id] || ''}
            onChange={(value) => handleChange(variable.id, value)}
          />
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Generate Content
      </Button>
    </form>
  );
}

interface VariableInputProps {
  variable: TemplateVariable;
  value: string;
  onChange: (value: string) => void;
}

function VariableInput({ variable, value, onChange }: VariableInputProps) {
  const label = (
    <Label htmlFor={variable.id}>
      {variable.label}
      {variable.required && <span className="text-red-500 ml-1">*</span>}
    </Label>
  );

  switch (variable.type) {
    case 'textarea':
      return (
        <div className="space-y-2">
          {label}
          <Textarea
            id={variable.id}
            placeholder={variable.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
          />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          {label}
          <Input
            id={variable.id}
            type="number"
            placeholder={variable.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          {label}
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id={variable.id}>
              <SelectValue placeholder={variable.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'text':
    default:
      return (
        <div className="space-y-2">
          {label}
          <Input
            id={variable.id}
            type="text"
            placeholder={variable.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}
