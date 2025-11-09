# Manual Tools Setup Guide

This guide explains how to set up and use the new manual tools that replace Dedalus Labs integration.

## Overview

The following tools have been added to your Augment application:

### 1. ArXiv Research Tools (No setup required)
- **searchArXiv** - Search for peer-reviewed research papers
- **getArXivPaper** - Get detailed information about specific papers

### 2. Google Docs Tools (Optional - requires authentication)
- **readGoogleDoc** - Read content from Google Documents
- **getGoogleDocMetadata** - Get document metadata

## Tool Installation

All tools have been installed and are automatically integrated into:
- Health Chat endpoint (`/api/health-chat`)
- Main chat endpoint (`/api/chat`) - via shared tools

### Installed Packages
```bash
@deepagent/arxiv@8.2.2
@deepagent/google-docs@8.2.2
googleapis@165.0.0
@google-cloud/local-auth@3.0.1
```

## ArXiv Tools Setup

### No Setup Required
The ArXiv tools work out of the box without any API keys or authentication.

### Usage Examples

#### Search for research papers
```
User: "Find recent research on personalized medicine"
AI uses: searchArXiv(query="personalized medicine", maxResults=10)
Result: List of paper titles, authors, abstracts, and links
```

#### Get specific paper details
```
User: "Tell me about arxiv paper 2401.08314"
AI uses: getArXivPaper(paperId="2401.08314")
Result: Full abstract, authors, publication date, PDF link
```

### Supported Topics
ArXiv covers papers in these categories:
- Computer Science (cs) - includes AI, machine learning, cybersecurity
- Physics (physics) - includes astronomy, quantum computing
- Mathematics (math)
- Biology (q-bio)
- Medicine (q-bio.ME)
- And more...

### Search Tips
- Use specific keywords for better results
- Can search by topic, author, or paper ID
- Results are sorted by relevance by default
- Maximum 100 results per search

## Google Docs Tools Setup

### Prerequisites
Google Docs integration is **optional**. Skip this section if you don't need it.

To use Google Docs tools, you need:
1. A Google Cloud Project
2. Google Docs API enabled
3. A service account with credentials

### Step-by-Step Setup

#### 1. Create a Google Cloud Project
```bash
1. Go to https://console.cloud.google.com/
2. Click "Create Project"
3. Enter a project name (e.g., "Augment Google Docs")
4. Click "Create"
5. Wait for the project to be created
```

#### 2. Enable Google Docs API
```bash
1. In the Google Cloud Console, search for "Google Docs API"
2. Click on "Google Docs API"
3. Click "Enable"
4. You'll see "API enabled" message
```

#### 3. Create Service Account
```bash
1. In the Google Cloud Console, go to "Service Accounts"
   - Search for "Service Accounts" in the search bar
   - Click on "Service Accounts" under "IAM & Admin"
2. Click "Create Service Account"
3. Enter service account name (e.g., "ai-gateway-docs")
4. Click "Create and Continue"
5. Grant basic Editor role (or custom role with docs.documents.get permission)
6. Click "Continue" and then "Done"
```

#### 4. Generate and Download Credentials
```bash
1. Go back to "Service Accounts" list
2. Click on the service account you just created
3. Go to the "Keys" tab
4. Click "Add Key" → "Create new key"
5. Choose "JSON" format
6. Click "Create"
7. A JSON file will automatically download
8. Save this file securely (e.g., ~/.config/google-credentials.json)
9. DO NOT commit this file to version control
```

#### 5. Set Environment Variable
```bash
# Add to your .env.local file:
GOOGLE_CREDENTIALS_PATH=/path/to/your/credentials.json

# Example:
GOOGLE_CREDENTIALS_PATH=~/.config/google-credentials.json
```

#### 6. Share Google Docs with Service Account
```bash
1. Copy the service account email from the JSON credentials file
   (It looks like: augment-docs@project-id.iam.gserviceaccount.com)
2. Open your Google Doc
3. Click "Share" button
4. Paste the service account email
5. Make sure it has "Viewer" access
6. Click "Share"
```

### Usage Examples

#### Read a Google Doc
```
User: "Read my treatment plan from Google Docs (docId: abc123...)"
AI uses: readGoogleDoc(documentId="abc123...")
Result: Full text content of the document
```

#### Check document access
```
User: "Can you access this Google Doc?"
AI uses: getGoogleDocMetadata(documentId="abc123...")
Result: Document title, character count, paragraph count
```

## File Locations

### New Tool Files
```
lib/arxiv-tools.ts              # ArXiv search tools
lib/google-docs-tools.ts        # Google Docs integration tools
```

### Updated Files
```
lib/tools.ts                    # Exports all tools
app/api/health-chat/route.ts    # Integrated into health chat
HEALTH_CHAT_TOOLS.md            # Documentation updated
env.example                     # Environment variables documented
```

## Testing Your Setup

### Test ArXiv Tools
```bash
# Start your dev server
pnpm dev

# In Health Chat (http://localhost:3001/health):
"Find research on machine learning in healthcare"

# Expected: List of ArXiv papers with titles, authors, and links
```

### Test Google Docs Tools (if configured)
```bash
# Make sure GOOGLE_CREDENTIALS_PATH is set in .env.local

# In Health Chat:
"Read my document: https://docs.google.com/document/d/[DOCUMENT_ID]/edit"

# Expected: Full document text or error if credentials not set properly
```

## Troubleshooting

### ArXiv Tools Issues

**"Failed to search ArXiv"**
- Check your internet connection
- Verify the search query is not empty
- ArXiv might be temporarily down

**No results found**
- Try different search terms
- Use more specific keywords
- Check if paper exists on ArXiv

### Google Docs Tools Issues

**"GOOGLE_CREDENTIALS_PATH environment variable is not set"**
- Add to `.env.local`: `GOOGLE_CREDENTIALS_PATH=/path/to/credentials.json`
- Restart the dev server: `pnpm dev`

**"Document not found or inaccessible"**
- Verify the document ID is correct
- Make sure service account has "Viewer" access
- Check that you shared the doc with the service account email

**"Permission denied"**
- Verify the service account has read access
- Re-share the document with the service account
- Wait a few minutes for permissions to propagate

**"Cannot authenticate with Google Docs"**
- Verify credentials.json file exists at the path
- Check the file is valid JSON
- Ensure it's a service account credentials file (not OAuth2)

## Migration from Dedalus

### What Changed
- ❌ Removed: Dedalus Labs integration (`lib/dedalus-client.ts`, `DEDALUS_INTEGRATION.md`)
- ❌ Removed: Dedalus environment variables
- ✅ Added: ArXiv search tools (research papers)
- ✅ Added: Google Docs integration (document reading)
- ✅ Added: Composio toolkit support (future use)

### Tools Comparison

| Capability | Dedalus | New Solution |
|-----------|---------|--------------|
| Research Papers | MCP-based | ArXiv tools (direct) |
| Document Access | MCP-based | Google Docs tools |
| Web Search | MCP-based | browseUrl + searchArXiv |
| Medical Data | MCP-based | browseUrl + ArXiv |

## Next Steps

1. **Configure ArXiv** (automatic - no setup needed)
   - Start using searchArXiv in Health Chat

2. **Optional: Configure Google Docs**
   - Follow the setup steps above
   - Test with readGoogleDoc

3. **Add More Tools** (if needed)
   - Tools can be added to `lib/*-tools.ts` files
   - Follow the same pattern as existing tools
   - Import and export from `lib/tools.ts`

## Additional Resources

- **ArXiv API**: https://arxiv.org/help/api/
- **Google Docs API**: https://developers.google.com/docs
- **Google Cloud Console**: https://console.cloud.google.com/
- **DeepAgent**: https://deepagent.amardeep.space/
- **Composio**: https://composio.dev/

## Support

For issues with:
- **ArXiv**: Check arxiv.org status and search terms
- **Google Docs**: Verify credentials file and permissions
- **AI SDK**: See https://sdk.vercel.ai/docs
- **This project**: Check the README and other documentation files
