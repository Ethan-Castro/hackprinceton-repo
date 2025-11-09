# Gamma API Integration Guide

This guide explains how to use the Gamma API integration for generating professional presentations, documents, and webpages.

## Overview

Gamma is an AI-powered platform for creating beautiful, professional presentations and documents. The integration provides four tools:

1. **generateGamma** - Create presentations, documents, webpages, or social content with comprehensive customization options
2. **getGammaGeneration** - Check status and get view/download URLs
3. **listGammaThemes** - View available design themes with pagination support
4. **listGammaFolders** - View available workspace folders for organizing gammas

## Setup

### Get Your API Key

1. Visit [Gamma.app](https://gamma.app)
2. Sign up or log in to your account
3. Go to Settings → API Keys
4. Create a new API key
5. Copy the key (format: `sk-gamma-...`)

### Configure Environment Variable

Add your API key to `.env.local`:

```bash
GAMMA_API_KEY=sk-gamma-your-api-key-here
```

Or use the pre-configured key in your `.env.local`:

```bash
GAMMA_API_KEY=sk-gamma-aCts1CGSdUw1m8zncuvjEAhFYoO43HXEuy45bfGRMfo
```

## Usage Examples

### Generate a Presentation

```typescript
// Using the AI with Gamma tools
User: "Create a presentation about fitness routines for beginners"

AI will:
1. Use generateGamma with your content
2. Create a professional presentation
3. Return a generation ID and view URL
4. User can view at: https://gamma.app/view/{generationId}
```

### Export to PDF

```typescript
User: "Create a fitness presentation and export as PDF"

AI will:
1. Use generateGamma with exportAs: "pdf"
2. Return generation ID
3. Check status with getGammaGeneration
4. When completed, return both viewUrl and downloadUrl
5. User can view online or download the PDF
```

### Check Available Themes

```typescript
User: "Show me available themes for health presentations"

AI will:
1. Use listGammaThemes
2. Return list of available design themes
3. User can reference themes when creating new presentations
```

## Gamma Tool Parameters

### generateGamma

**Core Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| inputText | string | required | Content to convert (1-100,000 chars). Can include image URLs. |
| format | enum | presentation | Type: presentation, document, webpage, social |
| textMode | enum | generate | generate (expand), condense (summarize), or preserve (keep exact) |
| numCards | number | 10 | Number of slides/sections (1-60 Pro, 1-75 Ultra) |
| cardSplit | enum | auto | auto (AI decides) or inputTextBreaks (use \n---\n breaks) |
| themeId | string | optional | Theme ID from listGammaThemes |
| additionalInstructions | string | optional | Extra specifications (max 2000 chars) |
| folderIds | array | optional | Array of folder IDs to organize the gamma |
| exportAs | enum | optional | Export format: pdf or pptx (get download link when complete) |

**Text Options:**

| Parameter | Type | Description |
|-----------|------|-------------|
| textAmount | enum | Amount of text per card: brief, medium, detailed, extensive |
| textTone | string | Tone/voice (e.g., "professional, inspiring") - max 500 chars |
| textAudience | string | Target audience (e.g., "outdoor enthusiasts") - max 500 chars |
| textLanguage | string | Language code (e.g., "en", "es", "fr") - supports 60+ languages |

**Image Options:**

| Parameter | Type | Description |
|-----------|------|-------------|
| imageSource | enum | Source: aiGenerated, pictographic, unsplash, giphy, webAllImages, webFreeToUse, webFreeToUseCommercially, placeholder, noImages |
| imageModel | string | AI model (e.g., "imagen-4-pro", "flux-1-pro") - only for aiGenerated |
| imageStyle | string | Style description (e.g., "photorealistic") - only for aiGenerated |

**Card Options:**

| Parameter | Type | Description |
|-----------|------|-------------|
| cardDimensions | string | Aspect ratio. Presentation: fluid/16x9/4x3, Document: fluid/pageless/letter/a4, Social: 1x1/4x5/9x16 |

**Sharing Options:**

| Parameter | Type | Description |
|-----------|------|-------------|
| workspaceAccess | enum | Access for workspace: noAccess, view, comment, edit, fullAccess |
| externalAccess | enum | Access for external users: noAccess, view, comment, edit |
| shareWithEmails | array | Email addresses to share with |
| emailAccess | enum | Access level for emails: view, comment, edit, fullAccess |

### getGammaGeneration

| Parameter | Type | Description |
|-----------|------|-------------|
| generationId | string | ID of the Gamma to retrieve |

Returns: status (pending/completed/failed), format, viewUrl (when completed), downloadUrl (if exportAs was used), title

### listGammaThemes

| Parameter | Type | Description |
|-----------|------|-------------|
| query | string (optional) | Search themes by name (case-insensitive) |
| limit | number (optional) | Number of themes per page (max 50) |
| after | string (optional) | Cursor token for next page (from previous response) |

Returns: themes array with id, name, type (standard/custom), colorKeywords, toneKeywords, hasMore, nextCursor

### listGammaFolders

| Parameter | Type | Description |
|-----------|------|-------------|
| query | string (optional) | Search folders by name (case-insensitive) |
| limit | number (optional) | Number of folders per page (max 50) |
| after | string (optional) | Cursor token for next page (from previous response) |

Returns: folders array with id and name, hasMore, nextCursor

## Supported Formats

### Presentation
- Ideal for: slide decks, training materials, proposals
- Export to: PDF, PPTX
- Best for: Visual, audience-facing content

### Document
- Ideal for: reports, guides, white papers
- Export to: PDF, PPTX
- Best for: Long-form written content

### Webpage
- Ideal for: interactive content, landing pages
- Export to: Limited (primarily for viewing)
- Best for: Shareable web experiences

### Social
- Ideal for: social media posts, graphics
- Export to: Image formats
- Best for: Bite-sized social content

## Text Processing Modes

### Generate (Default)
- AI rewrites and enhances your content
- Best for: rough notes, outlines
- Result: Professional, polished content

### Condense
- AI shortens your content
- Best for: verbose or redundant text
- Result: Concise key points

### Preserve
- Your content stays unchanged
- Best for: finalized text
- Result: Layouts around your exact words

## Use Cases in Health Chat

### 1. Fitness Plans
```
User: "Create a 12-week fitness plan for weight loss"
AI:
  - Researches fitness best practices (ArXiv)
  - Generates a professional Gamma presentation
  - User gets beautiful, shareable fitness plan
```

### 2. Treatment Plans
```
User: "Make a treatment plan presentation from my medical notes"
AI:
  - Reads and processes medical information
  - Generates formatted presentation
  - Exports to PDF for healthcare provider
```

### 3. Health Research
```
User: "Create a presentation on diabetes management"
AI:
  - Searches ArXiv for latest research
  - Generates professional presentation
  - Includes citations and links
  - Exports to PDF/PPTX
```

### 4. Wellness Programs
```
User: "Generate a company wellness program proposal"
AI:
  - Creates professional presentation
  - Includes research and statistics
  - Exports as PPTX for distribution
```

## Workflow Example

```
Step 1: User Request
"Create a professional presentation about healthy eating habits with 15 slides"

Step 2: AI Processing
- Gathers content about healthy eating
- Searches ArXiv for nutrition research
- Prepares comprehensive information

Step 3: Gamma Generation
AI calls: generateGamma({
  inputText: "[comprehensive healthy eating content]",
  format: "presentation",
  numCards: 15,
  textMode: "generate"
})

Step 4: Generation Complete
Returns: generationId, viewUrl
User can view at: https://gamma.app/view/[generationId]

Step 5: Export (Optional - can also be done during generation)
Option A - Export during generation:
Use exportAs parameter in generateGamma
Returns: downloadUrl when status is completed

Option B - Export existing gamma:
Export functionality is built into the Gamma app
User can manually export from https://gamma.app/view/[generationId]

Step 6: Download
User downloads the professional PDF presentation
```

## API Response Examples

### Success Response (generateGamma)
```json
{
  "generationId": "gamma_abc123xyz",
  "format": "presentation",
  "status": "created",
  "message": "Successfully created presentation. Generation ID: gamma_abc123xyz",
  "viewUrl": "https://gamma.app/view/gamma_abc123xyz"
}
```

### Error Handling
If the API key is missing:
```
Error: GAMMA_API_KEY environment variable is not set
```

If the API key is invalid:
```
Error: Gamma API error: 401 - {"error": "Unauthorized"}
```

## Troubleshooting

### "GAMMA_API_KEY environment variable is not set"
- Add GAMMA_API_KEY to `.env.local`
- Restart your dev server: `pnpm dev`
- Verify the key format: `sk-gamma-...`

### "Unauthorized" Error
- Verify your API key is correct
- Check you copied the entire key
- Generate a new key from Gamma.app settings

### Generation Takes Long Time
- Large documents (100+ cards) may take time
- Check status with: `getGammaGeneration(generationId)`
- Wait a few moments and check again

### Export Failed
- Verify the generation was completed first
- Try with a different export format
- Check available export formats for your content type

## Best Practices

1. **Content Quality**
   - Provide clear, well-structured input text
   - Use `textMode: "generate"` for outlines
   - Use `textMode: "preserve"` for final text

2. **Formatting**
   - Use line breaks for major sections
   - Keep related content together
   - Provide context and descriptions

3. **Card Management**
   - Start with default (10 cards)
   - Adjust based on content complexity
   - More cards = more detailed presentation

4. **Theme Selection**
   - Use `listGammaThemes` to see options
   - Choose themes matching your content type
   - Professional themes for business content

5. **Exports**
   - PDF for viewing and printing
   - PPTX for editing and refinement
   - Generate both for flexibility

## Integration with Other Tools

The Gamma tools work together with other health chat tools:

```
Research → Content → Generation → Export

ArXiv Search
     ↓
  Content Creation
     ↓
  Gamma Generation
     ↓
  PDF/PPTX Export
```

### Example Workflow
1. Search ArXiv for health research
2. Read relevant Google Docs
3. Synthesize findings
4. Generate Gamma presentation
5. Export as PDF
6. Share with stakeholders

## Files

- **Tool File**: `lib/gamma-tools.ts`
- **Integration**: `lib/tools.ts`
- **Chat Endpoint**: `app/api/health-chat/route.ts`
- **Environment**: `.env.local`, `env.example`
- **Documentation**: `HEALTH_CHAT_TOOLS.md`

## API Documentation

For more details, see:
- [Gamma API Docs](https://gamma.app/docs/api)
- [Gamma Dashboard](https://app.gamma.app)
- [Getting Started](https://gamma.app/help)

## Support

For issues with:
- **Gamma API**: Check Gamma.app documentation or contact Gamma support
- **Integration**: Review this guide or check tool error messages
- **Health Chat**: See main README and other documentation files

## Next Steps

1. ✅ Add GAMMA_API_KEY to `.env.local` (already done)
2. Start your dev server: `pnpm dev`
3. Test in Health Chat: "Create a presentation about..."
4. Share your generated presentations!
