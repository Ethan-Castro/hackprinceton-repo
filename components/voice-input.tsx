"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MicIcon, MicOffIcon, LoaderIcon } from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInput({ onTranscript, disabled, className }: VoiceInputProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { isRecording, recordingTime, startRecording, stopRecording, error } = useAudioRecorder();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording and transcribe
      setIsTranscribing(true);
      const audioBlob = await stopRecording();
      
      if (audioBlob) {
        try {
          // Send to STT API
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          const response = await fetch("/api/stt", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Failed to transcribe audio");
          }

          const data = await response.json();
          
          if (data.text) {
            onTranscript(data.text);
            toast.success("Voice transcribed successfully!");
          } else {
            toast.error("No speech detected");
          }
        } catch (err) {
          console.error("Transcription error:", err);
          toast.error("Failed to transcribe audio");
        }
      }
      
      setIsTranscribing(false);
    } else {
      // Start recording
      await startRecording();
    }
  };

  // Show error toast if recording error occurs
  if (error) {
    toast.error(error);
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        size="icon"
        variant={isRecording ? "destructive" : "ghost"}
        onClick={handleToggleRecording}
        disabled={disabled || isTranscribing}
        className={cn(
          "h-9 w-9 rounded-xl transition-all duration-150",
          isRecording && "animate-pulse"
        )}
        title={isRecording ? "Stop recording" : "Start voice input"}
      >
        {isTranscribing ? (
          <LoaderIcon className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <MicOffIcon className="h-4 w-4" />
        ) : (
          <MicIcon className="h-4 w-4" />
        )}
      </Button>
      
      {isRecording && (
        <span className="text-xs text-muted-foreground animate-fade-in">
          {formatTime(recordingTime)}
        </span>
      )}
    </div>
  );
}

