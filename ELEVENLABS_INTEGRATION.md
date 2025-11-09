# ElevenLabs TTS & STT Integration

This document describes the ElevenLabs Text-to-Speech (TTS) and Speech-to-Text (STT) integration in the AI chat application.

## Overview

The application now supports:
- **Voice Input (STT)**: Users can speak into their microphone and have their speech transcribed to text
- **Text-to-Speech (TTS)**: Users can have AI responses read aloud

## Features

### 1. Voice Input (Speech-to-Text)
- Click the microphone icon to start recording
- Speak your question or message
- Click the microphone icon again to stop recording and transcribe
- The transcribed text will be automatically inserted into the input field
- Visual feedback with recording timer and animated microphone icon

### 2. Text-to-Speech
- Hover over any assistant message to reveal the TTS button (speaker icon)
- Click the speaker icon to have the message read aloud
- Click again to stop playback
- Visual feedback with animated speaker icon during playback

## Architecture

### API Endpoints

#### `/api/tts` - Text-to-Speech
- **Method**: POST
- **Input**: 
  ```json
  {
    "text": "Text to convert to speech",
    "voiceId": "JBFqnCBsd6RMkjVDRZzb", // optional, defaults to George
    "modelId": "eleven_turbo_v2_5" // optional
  }
  ```
- **Output**: Audio stream (MP3 format)
- **Features**:
  - Uses ElevenLabs Turbo v2.5 model for low latency
  - Configurable voice settings (stability, similarity_boost, speaker_boost)
  - Streams audio directly to client

#### `/api/stt` - Speech-to-Text
- **Method**: POST
- **Input**: FormData with audio file
  ```typescript
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  ```
- **Output**: 
  ```json
  {
    "text": "Transcribed text",
    "duration": 5.2,
    "language": "en"
  }
  ```
- **Features**:
  - Uses ElevenLabs Scribe v1 model
  - Automatic language detection
  - Supports various audio formats

### Components

#### `VoiceInput`
Location: `components/voice-input.tsx`

A component that provides microphone recording and transcription capabilities.

**Props**:
- `onTranscript: (text: string) => void` - Callback when transcription is complete
- `disabled?: boolean` - Disable recording
- `className?: string` - Additional CSS classes

**Features**:
- Real-time recording timer
- Visual feedback (animated microphone icon)
- Error handling with toast notifications
- Loading state during transcription

#### `TextToSpeechButton`
Location: `components/text-to-speech-button.tsx`

A button component that converts text to speech and plays it.

**Props**:
- `text: string` - Text to convert to speech
- `className?: string` - Additional CSS classes
- `variant?: "ghost" | "outline" | "default"` - Button variant
- `size?: "default" | "sm" | "lg" | "icon"` - Button size

**Features**:
- Play/stop functionality
- Loading state indicator
- Error handling with toast notifications
- Automatic cleanup of audio resources

### Hooks

#### `useAudioRecorder`
Location: `hooks/use-audio-recorder.ts`

Custom hook for managing audio recording from the microphone.

**Returns**:
```typescript
{
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  audioBlob: Blob | null;
  error: string | null;
}
```

**Features**:
- Records audio in WebM format
- Supports pause/resume
- Real-time recording duration
- Automatic resource cleanup
- Error handling

#### `useTextToSpeech`
Location: `hooks/use-text-to-speech.ts`

Custom hook for managing text-to-speech playback.

**Returns**:
```typescript
{
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  speak: (text: string) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}
```

**Features**:
- Fetches and plays TTS audio
- Play/pause/stop controls
- Loading states
- Automatic resource cleanup (URL.revokeObjectURL)
- Error handling

## Setup

### 1. Environment Variables

Add your ElevenLabs API key to your `.env.local` file:

```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Get your API key from: https://elevenlabs.io/app/settings/api-keys

### 2. Installation

All required dependencies are already installed:
- `elevenlabs`: ElevenLabs SDK
- `react-hot-toast`: Toast notifications for user feedback

### 3. Usage

The voice features are automatically integrated into the main chat component (`components/chat.tsx`). No additional setup is required.

## Voice Options

### Available Voices

The default voice is "George" (ID: `JBFqnCBsd6RMkjVDRZzb`). You can customize the voice by modifying the TTS API endpoint.

Popular ElevenLabs voices:
- George (JBFqnCBsd6RMkjVDRZzb) - Default, clear male voice
- Rachel (21m00Tcm4TlvDq8ikWAM) - Professional female voice
- Adam (pNInz6obpgDQGcFmaJgB) - Deep male voice
- Charlotte (XB0fDUnXU5powFXDhCwa) - Warm female voice
- Bella (EXAVITQu4vr4xnSDxMaL) - Soft female voice

### Voice Settings

You can customize voice settings in `/api/tts/route.ts`:

```typescript
voice_settings: {
  stability: 0.5,           // 0-1: Lower = more expressive, Higher = more stable
  similarity_boost: 0.75,   // 0-1: How closely to match the original voice
  use_speaker_boost: true,  // Boost clarity for speaking
}
```

## Models

### TTS Models
- **eleven_turbo_v2_5** (Default): Fastest model, lowest latency
- **eleven_multilingual_v2**: Better quality, supports multiple languages
- **eleven_monolingual_v1**: English only, high quality

### STT Models
- **scribe_v1** (Default): High-accuracy transcription with diarization support

## Browser Compatibility

### Voice Input (STT)
Requires browser support for:
- `navigator.mediaDevices.getUserMedia()` - Microphone access
- `MediaRecorder` API - Audio recording

Supported browsers:
- Chrome/Edge 47+
- Firefox 25+
- Safari 14.1+
- Opera 36+

### Text-to-Speech (TTS)
Requires browser support for:
- `Audio` API - Audio playback
- `fetch` API - Network requests

Supported by all modern browsers.

## User Experience

### Voice Input Flow
1. User clicks microphone icon
2. Browser requests microphone permission (first time only)
3. Recording starts with visual feedback (animated icon + timer)
4. User speaks their message
5. User clicks microphone icon again to stop
6. Audio is transcribed via ElevenLabs API
7. Transcribed text appears in input field
8. Toast notification confirms success

### TTS Flow
1. User hovers over assistant message
2. Speaker icon fades in
3. User clicks speaker icon
4. Audio is generated via ElevenLabs API (with loading indicator)
5. Audio plays automatically
6. Speaker icon animates during playback
7. User can click again to stop

## Error Handling

Both features include comprehensive error handling:

- **Permission Denied**: User-friendly message asking to enable microphone
- **Network Errors**: Retry suggestions with error details
- **API Errors**: Clear error messages via toast notifications
- **Browser Compatibility**: Graceful degradation for unsupported browsers

## Performance Considerations

### TTS Optimization
- Uses `eleven_turbo_v2_5` model for fast generation
- Audio is streamed directly without intermediate storage
- Automatic cleanup of audio URLs to prevent memory leaks

### STT Optimization
- Records in WebM format for efficiency
- Collects audio data every 100ms for smooth recording
- Automatic stream cleanup after transcription

## Security

- API keys are stored server-side only (never exposed to client)
- Audio data is transmitted over HTTPS
- Temporary audio blobs are cleaned up after use
- No audio data is stored permanently

## Customization

### Changing Default Voice

Edit `/app/api/tts/route.ts`:

```typescript
const { 
  text, 
  voiceId = "YOUR_PREFERRED_VOICE_ID", // Change this
  modelId = "eleven_turbo_v2_5" 
} = await req.json();
```

### Adjusting STT Language

Edit `/app/api/stt/route.ts`:

```typescript
const transcription = await client.speechToText.convert({
  file: audioBlob,
  model_id: "scribe_v1",
  language_code: "en", // Change from null to specific language code
  // ... other settings
});
```

### Styling

Both components support custom styling via the `className` prop and use Tailwind CSS for styling.

## Troubleshooting

### Voice input not working
- Check microphone permissions in browser settings
- Ensure HTTPS connection (required for microphone access)
- Verify ELEVENLABS_API_KEY is set correctly
- Check browser console for errors

### TTS not playing
- Check browser audio permissions
- Verify ELEVENLABS_API_KEY is set correctly
- Check network tab for API errors
- Ensure audio output device is working

### Poor transcription quality
- Speak clearly and at a moderate pace
- Reduce background noise
- Check microphone quality and positioning
- Try specifying language code instead of auto-detect

## Future Enhancements

Potential improvements:
- [ ] Voice selection UI for users
- [ ] Custom voice cloning
- [ ] Real-time streaming transcription
- [ ] Multi-language support UI
- [ ] Voice activity detection
- [ ] Audio waveform visualization
- [ ] Playback speed control
- [ ] Download TTS audio
- [ ] Voice command support

## Resources

- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [ElevenLabs API Reference](https://elevenlabs.io/docs/api-reference)
- [Voice Library](https://elevenlabs.io/voice-library)
- [Pricing](https://elevenlabs.io/pricing)

## Support

For issues related to:
- **ElevenLabs API**: Contact ElevenLabs support or check their documentation
- **Integration code**: Create an issue in the project repository
- **Browser compatibility**: Check browser console and ensure latest version

## License

This integration uses the ElevenLabs API which has its own terms of service and pricing. Refer to ElevenLabs' website for details.

