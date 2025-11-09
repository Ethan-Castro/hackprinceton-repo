import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTemplate } from '@/lib/templates/registry';
import { templateEngine } from '@/lib/templates/engine';

const generateRequestSchema = z.object({
  variables: z.record(z.string(), z.string()),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { variables } = generateRequestSchema.parse(body);

    // Get template
    const template = getTemplate(id);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Validate variables
    const validation = templateEngine.validateVariables(template, variables);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid variables', details: validation.errors },
        { status: 400 }
      );
    }

    // Generate content
    const generatedContent = await templateEngine.generateFromTemplate(
      template,
      variables
    );

    return NextResponse.json(generatedContent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Template generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content from template' },
      { status: 500 }
    );
  }
}
