# Health Chat Tools

The Health Chat has access to multiple tools that enable rich, interactive, and research-driven health coaching experiences.

## Available Tools

### 1. Display Tools

#### displayArtifact
Creates a structured, downloadable container for plans, reports, and documents.

**Use cases:**
- Fitness plans and workout routines
- Meal plans and nutrition guides
- Medical report summaries
- Health education materials

**Example:**
```
User: "Create a 7-day meal plan for someone with diabetes"
AI: Uses displayArtifact to generate a downloadable, well-formatted meal plan
```

#### displayWebPreview
Shows live previews of websites and online resources.

**Use cases:**
- Displaying medical research websites
- Showing health organization resources (CDC, WHO, etc.)
- Linking to reputable health information

**Example:**
```
User: "Show me the CDC guidelines for heart health"
AI: Uses displayWebPreview to show the CDC website
```

#### generateHtmlPreview
Creates interactive HTML visualizations and widgets.

**Use cases:**
- BMI calculators
- Interactive exercise trackers
- Nutrition charts and visualizations
- Health progress dashboards

**Example:**
```
User: "Create an interactive BMI calculator"
AI: Uses generateHtmlPreview to generate working calculator
```

### 2. Research Tools

#### browseUrl
Fetches and analyzes web content from medical sources.

**Use cases:**
- Researching latest medical studies
- Fetching current health guidelines
- Analyzing health news articles
- Accessing medical databases

**Example:**
```
User: "What are the latest treatments for hypertension?"
AI: Uses browseUrl to fetch recent medical articles
```

### 3. Data Management Tools

#### saveTrackerEntry
Persists health tracking data to the Neo4j database.

**Use cases:**
- Saving workout logs
- Tracking medication adherence
- Recording vital signs
- Logging symptoms

**Example:**
```
User: "Log my workout: 30 min cardio, 145 bpm average"
AI: Uses saveTrackerEntry to save the workout data
```

#### indexReport
Stores medical reports for future reference and analysis.

**Use cases:**
- Storing lab results
- Archiving medical test reports
- Saving diagnostic imaging summaries
- Building medical history

**Example:**
```
User: "Save this blood test report for reference"
AI: Uses indexReport to store the report in the database
```

### 4. Academic Research Tools

#### searchArXiv
Searches for peer-reviewed research papers on arXiv, covering topics like machine learning, physics, mathematics, biology, computer science, and more.

**Use cases:**
- Finding latest research papers on health topics
- Searching for machine learning applications in medicine
- Looking up computational biology studies
- Finding peer-reviewed academic sources

**Parameters:**
- `query`: Search terms (e.g., "machine learning health", "COVID-19 vaccines", "quantum computing")
- `maxResults`: Number of results (1-100, default: 10)
- `sortBy`: Sort order (relevance, lastUpdatedDate, submittedDate)

**Example:**
```
User: "Find recent research on personalized medicine"
AI: Uses searchArXiv to find papers on personalized medicine
Result: Returns paper titles, authors, abstracts, and arXiv links
```

#### getArXivPaper
Gets detailed information about a specific arXiv paper including full abstract, authors, and PDF link.

**Use cases:**
- Getting detailed information about a specific paper
- Retrieving full abstracts and author information
- Accessing PDF download links

**Example:**
```
User: "Tell me more about arXiv paper 2401.12345"
AI: Uses getArXivPaper to retrieve full details
```

### 5. Document Integration Tools

#### readGoogleDoc
Reads the full content of a Google Document (requires authentication).

**Requirements:**
- `GOOGLE_CREDENTIALS_PATH` environment variable must point to a Google service account credentials JSON file
- The service account must have read access to the document

**Use cases:**
- Importing treatment plans from shared documents
- Reading research notes or literature reviews
- Accessing shared medical documents
- Importing health guidelines from collaborative docs

**Setup:**
1. Create a Google Cloud project
2. Enable the Google Docs API
3. Create a service account and download the credentials JSON
4. Set `GOOGLE_CREDENTIALS_PATH` to the credentials file path
5. Share your Google Doc with the service account email

**Example:**
```
User: "Read the treatment plan from my shared Google Doc (docId)"
AI: Uses readGoogleDoc to fetch the document content
Result: Returns full document text for analysis and reference
```

#### getGoogleDocMetadata
Gets metadata about a Google Document (title, character count, paragraph count) without reading full content.

**Use cases:**
- Checking document availability and access
- Getting document statistics
- Verifying document information before processing

**Example:**
```
User: "Check if I have access to this Google Doc"
AI: Uses getGoogleDocMetadata to verify access
```

### 6. MCP Tools (Optional)

When MCP (Model Context Protocol) is configured, additional tools become available:

- **Medical Database Search** - Search PubMed, FDA databases, WHO resources
- **Clinical Trials Lookup** - Find relevant clinical trials
- **Drug Information** - Get detailed drug interactions and information
- **ICD-10 Codes** - Look up diagnostic codes
- **Web Search** - Search the internet for health information

## How Tools Work

### Tool Calling Flow

1. **User Input** - User sends a message in Health Chat
2. **Model Analysis** - AI model determines if tools are needed
3. **Tool Selection** - Model chooses appropriate tool(s) to use
4. **Tool Execution** - Tools execute on the server
5. **Result Integration** - Tool results are provided to the model
6. **Response Generation** - Model generates response with tool results
7. **UI Display** - Results are rendered in the chat interface

### Multi-Step Tool Calling

The Health Chat supports multi-step tool calling, allowing the AI to:
- Use multiple tools in sequence
- Use tool results to inform next tool calls
- Build complex research workflows

**Example:**
```
User: "Research vitamin D and create a supplement guide"

Step 1: Uses browseUrl to research vitamin D
Step 2: Uses displayArtifact to create formatted guide
Result: Comprehensive, research-backed supplement guide
```

### Tool Logging

All tool calls are logged in the server console for debugging:

```bash
[Health Chat] Tool calls: ['browseUrl', 'displayArtifact']
[Health Chat] Tool results: [{ tool: 'browseUrl', success: true }, ...]
```

## Tool Configuration

### Base Tools (Always Available)

Defined in [lib/tools.ts](lib/tools.ts):
- `displayArtifact`
- `displayWebPreview`
- `generateHtmlPreview`

### Health-Specific Tools

Defined in [lib/health-tools.ts](lib/health-tools.ts):
- `browseUrl`
- `saveTrackerEntry`
- `indexReport`

### MCP Tools (Optional)

Configured via environment variables:
```bash
# Enable direct MCP integration
MCP_SERVER_URL=https://your-mcp-server.com
MCP_API_KEY=your_api_key
```

## Tool Rendering in the UI

The [Chat component](components/chat.tsx) handles tool result rendering:

### Artifact Rendering
```tsx
<ArtifactRenderer
  title={toolResult.title}
  description={toolResult.description}
  content={toolResult.content}
  contentType={toolResult.contentType}
  language={toolResult.language}
/>
```

### Web Preview Rendering
```tsx
<WebPreviewRenderer
  url={toolResult.url}
  title={toolResult.title}
  description={toolResult.description}
/>
```

### HTML Preview Rendering
```tsx
<HtmlPreviewRenderer
  html={toolResult.html}
  title={toolResult.title}
  description={toolResult.description}
/>
```

## Testing Tools

### Test displayArtifact
```
User: "Create a 7-day workout plan for beginners"
Expected: Downloadable fitness plan in an artifact container
```

### Test browseUrl
```
User: "Research the benefits of Mediterranean diet"
Expected: Summary of research with citations
```

### Test saveTrackerEntry
```
User: "Log today's workout: 5k run in 28 minutes"
Expected: Confirmation that workout was saved
```

### Test Multi-Step
```
User: "Research vitamin C and create a supplement guide"
Expected: Uses browseUrl then displayArtifact in sequence
```

## Troubleshooting

### Tools Not Being Called

**Symptoms:**
- AI responds without using tools
- No tool results in server logs

**Solutions:**
1. Use a capable model (GPT-4, GPT-4.1, not GPT-3.5)
2. Be more specific in prompts ("create an artifact" vs "tell me about")
3. Check tool descriptions are clear
4. Verify tools are properly registered

### Tool Execution Errors

**Symptoms:**
- Server errors in console
- "Tool failed to execute" messages

**Solutions:**
1. Check tool implementation in lib/health-tools.ts
2. Verify Neo4j connection for database tools
3. Check network access for browseUrl
4. Review server logs for detailed errors

### Tool Results Not Rendering

**Symptoms:**
- Tool executes but UI doesn't show results
- Console shows tool results but nothing displays

**Solutions:**
1. Check tool result format matches expected schema
2. Verify tool renderers are imported in Chat component
3. Check browser console for React errors
4. Ensure tool result types match TypeScript definitions

## Best Practices

### For Users

1. **Be Specific** - "Create a workout artifact" vs "tell me about workouts"
2. **One Request at a Time** - Let tools complete before next request
3. **Check Results** - Verify tool results make sense before proceeding

### For Developers

1. **Strong Models** - Use GPT-4 or GPT-4.1 for reliable tool calling
2. **Clear Descriptions** - Tool descriptions should explain when to use them
3. **Validate Inputs** - Use Zod schemas to validate tool parameters
4. **Handle Errors** - Gracefully handle tool execution failures
5. **Test Thoroughly** - Test each tool individually and in combinations

## Examples

### Example 1: Create Fitness Plan

**Input:**
```
Create a beginner-friendly 4-week fitness plan focusing on cardio and strength
```

**Tools Used:**
1. `displayArtifact` - Creates formatted 4-week plan

**Output:**
- Downloadable fitness plan artifact
- Weekly breakdown with exercises
- Progress tracking suggestions

### Example 2: Research and Educate

**Input:**
```
Research the health benefits of intermittent fasting and create an educational guide
```

**Tools Used:**
1. `browseUrl` - Researches intermittent fasting studies
2. `displayArtifact` - Creates comprehensive guide

**Output:**
- Research-backed information
- Formatted educational guide
- Citations and sources

### Example 3: Track Progress

**Input:**
```
Log my workout: 45 min weights, 3 sets of 10 reps each exercise
```

**Tools Used:**
1. `saveTrackerEntry` - Saves workout to database

**Output:**
- Confirmation of saved workout
- Ability to review history later
- Progress tracking enabled

## Future Enhancements

Potential tool additions:
- **Image Analysis** - Analyze food photos for nutrition info
- **Voice Notes** - Transcribe and store health notes
- **Appointment Scheduling** - Integration with calendar APIs
- **Medication Reminders** - Set up reminder systems
- **Wearable Integration** - Connect to Fitbit, Apple Health, etc.

## Related Documentation

- [Tools Documentation (AI SDK)](/docs/foundations/tools)
- [Tool Calling Guide](/docs/ai-sdk-core/tools-and-tool-calling)
- [MCP Integration Guide](MCP_INTEGRATION.md)
