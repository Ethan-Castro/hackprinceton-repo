"use client";

import { Button } from "@/components/ui/button";
import { VolumeIcon, Volume2Icon, LoaderIcon, PauseIcon } from "lucide-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "default" | "sm" | "lg" | "icon";
}

export function TextToSpeechButton({ 
  text, 
  className, 
  variant = "ghost",
  size = "icon" 
}: TextToSpeechButtonProps) {
  const { isPlaying, isLoading, error, speak, stop, pause } = useTextToSpeech();

  // Show error toast if TTS error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleClick = async () => {
    if (isPlaying) {
      stop();
    } else {
      await speak(text);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={handleClick}
      disabled={isLoading || !text.trim()}
      className={cn(
        "transition-all duration-150",
        size === "icon" && "h-8 w-8 rounded-lg",
        className
      )}
      title={isPlaying ? "Stop audio" : "Read aloud"}
    >
      {isLoading ? (
        <LoaderIcon className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Volume2Icon className="h-4 w-4 animate-pulse" />
      ) : (
        <VolumeIcon className="h-4 w-4" />
      )}
    </Button>
  );
}

