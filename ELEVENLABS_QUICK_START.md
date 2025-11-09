# ElevenLabs TTS & STT - Quick Start Guide

Get started with voice features in your AI chat in 3 simple steps!

## Setup (5 minutes)

### Step 1: Get Your API Key

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up or log in
3. Navigate to [Settings > API Keys](https://elevenlabs.io/app/settings/api-keys)
4. Click "Create API Key"
5. Copy your API key

### Step 2: Add API Key to Environment

Create or update your `.env.local` file:

```bash
ELEVENLABS_API_KEY=sk_your_api_key_here
```

### Step 3: Start the Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

That's it! 🎉

## Using Voice Features

### Voice Input (Speech-to-Text)

1. Open any chat page (e.g., http://localhost:3000)
2. Look for the **microphone icon** 🎤 in the input area
3. Click the microphone icon to start recording
4. Speak your question or message
5. Click the microphone icon again to stop
6. Wait for transcription (~1-2 seconds)
7. Your text appears in the input field
8. Press Enter or click Send

**Tips:**
- Speak clearly at a moderate pace
- Wait for the transcription to complete before speaking again
- Recording time is shown next to the microphone
- A loading spinner appears during transcription

### Text-to-Speech (Read Aloud)

1. Send a message and wait for the AI response
2. **Hover over the assistant's message**
3. A **speaker icon** 🔊 appears at the bottom of the message
4. Click the speaker icon to hear the message read aloud
5. Click again to stop playback

**Tips:**
- Works with any text message from the AI
- The speaker icon animates during playback
- Audio plays in the background, you can continue using the app

## Features at a Glance

| Feature | Icon | Action |
|---------|------|--------|
| Start Recording | 🎤 | Click microphone icon |
| Stop Recording | 🔴 | Click microphone icon again |
| Transcribing | ⏳ | Animated loading spinner |
| Read Aloud | 🔊 | Hover over message, click speaker |
| Stop Audio | 🔊 (animated) | Click speaker icon again |

## Keyboard Shortcuts

- **Cmd/Ctrl + Enter**: Send message without using mouse
- **Escape**: (Future) Stop recording or audio playback

## Browser Requirements

### For Voice Input
- Chrome 47+
- Firefox 25+
- Safari 14.1+
- Edge 47+

### For Text-to-Speech
- All modern browsers

**Note**: Voice input requires **HTTPS** or **localhost**. Microphone access is blocked on insecure connections.

## Troubleshooting

### "Microphone access denied"
1. Check browser permission icon in the address bar
2. Allow microphone access
3. Refresh the page

### "No speech detected"
- Try speaking louder or closer to the microphone
- Check your microphone is working (test in system settings)
- Ensure no other app is using the microphone

### "Failed to generate speech"
- Verify your API key is correct in `.env.local`
- Restart the development server
- Check your ElevenLabs account has credits

### Audio not playing
- Check system volume
- Try a different browser
- Check browser console for errors (F12)

## API Usage & Pricing

ElevenLabs offers:
- **Free Tier**: 10,000 characters/month for TTS
- **Starter Plan**: $5/month for 30,000 characters
- **Creator Plan**: $22/month for 100,000 characters

### Character Usage Examples
- **Short message** (50 chars): ~200 messages/month (free tier)
- **Medium message** (200 chars): ~50 messages/month (free tier)
- **Long message** (500 chars): ~20 messages/month (free tier)

**Pro Tip**: TTS is only used when you click the speaker icon, so it won't consume credits unless you actively use it.

## Next Steps

### Customize Voices

Edit `app/api/tts/route.ts` to change the default voice:

```typescript
const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel (female voice)
```

Popular voices:
- `JBFqnCBsd6RMkjVDRZzb` - George (default male)
- `21m00Tcm4TlvDq8ikWAM` - Rachel (female)
- `pNInz6obpgDQGcFmaJgB` - Adam (deep male)

Browse all voices at: https://elevenlabs.io/voice-library

### Adjust Voice Settings

Edit voice settings in `app/api/tts/route.ts`:

```typescript
voice_settings: {
  stability: 0.5,           // 0 = expressive, 1 = stable
  similarity_boost: 0.75,   // How close to original voice
  use_speaker_boost: true,  // Clarity boost
}
```

### Set Language for Better Accuracy

Edit `app/api/stt/route.ts` for better transcription:

```typescript
language_code: "en",  // English
// or "es" for Spanish, "fr" for French, etc.
```

## Demo Video

(Coming soon - watch a video demonstration of the features)

## Need Help?

- 📖 Full Documentation: See `ELEVENLABS_INTEGRATION.md`
- 🐛 Issues: Create an issue in the repository
- 💬 Questions: Contact support

## What's Next?

Try these ideas:
- Use voice input for hands-free interaction
- Have long responses read aloud while you multitask
- Test different voices to find your favorite
- Try different languages for transcription
- Build custom voice-first experiences

Enjoy your voice-enabled AI chat! 🎉

