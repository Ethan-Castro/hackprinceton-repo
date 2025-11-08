# v0 Clone Experiments Page

A v0 clone implementation that allows you to build UI components and apps using natural language, similar to [v0.dev](https://v0.dev).

## Features

- **Split-panel interface**: Chat on the left, live preview on the right
- **AI-powered generation**: Describe what you want to build, and v0 creates it
- **Live preview**: Instant iframe preview of generated apps
- **Conversation history**: Track your prompts and responses
- **Suggestion chips**: Quick-start prompts for common use cases

## Setup

1. **Get a v0 API Key**
   - Visit [v0.dev/chat/settings/keys](https://v0.dev/chat/settings/keys)
   - Create a new API key
   - Add it to your `.env.local` file:
   ```bash
   V0_API_KEY=your_v0_api_key_here
   ```

2. **Start the development server**
   ```bash
   pnpm dev
   ```

3. **Navigate to the experiments page**
   - Open [http://localhost:3000/experiments](http://localhost:3000/experiments)

## Usage

1. Type your request in the input field (e.g., "Create a responsive navbar with Tailwind CSS")
2. Press Enter or click the send button
3. Wait for v0 to generate your app
4. View the live preview in the right panel
5. Continue the conversation to refine your creation

## Components

The experiments page uses the following AI Elements components:

- **PromptInput**: Text input with submit button
- **Message/MessageContent**: Chat message display
- **Conversation**: Conversation wrapper
- **WebPreview**: Live iframe preview with navigation
- **Loader**: Loading spinner
- **Suggestion**: Quick-start suggestion chips

## API

The experiments page uses a dedicated API route at `/api/v0-chat` that:
- Creates new v0 chats
- Sends messages to existing chats
- Returns the chat ID and demo URL

## Theme

The experiments page matches the app's theme using:
- Consistent typography (Geist Sans)
- Dark/light mode support via ThemeProvider
- Matching border, spacing, and color schemes
- Sidebar integration (automatically wrapped by layout)

## Tips

- Start with the suggestion chips for common use cases
- Be specific in your prompts for better results
- You can continue conversations to refine your creation
- The preview updates automatically when v0 generates a new version

## Troubleshooting

- **"Message is required" error**: Make sure you've entered text before submitting
- **"Failed to create chat" error**: Check that your V0_API_KEY is set correctly in `.env.local`
- **Empty preview**: Wait a moment for v0 to generate the app, or check the console for errors
