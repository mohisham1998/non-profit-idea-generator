import React from "react";
import * as LucideIcons from "lucide-react";
import { RotateCw } from "lucide-react";

export interface ImagePlaceholderProps {
  gradientFrom: string;
  gradientTo: string;
  iconName: string;
  size?: "small" | "medium" | "large";
  onRetry?: () => void;
  showRetry?: boolean;
}

const LucideIconMap = LucideIcons as unknown as Record<
  string,
  React.ComponentType<{ className?: string; size?: number }>
>;

export function ImagePlaceholder({
  gradientFrom,
  gradientTo,
  iconName,
  size = "large",
  onRetry,
  showRetry = false,
}: ImagePlaceholderProps) {
  const Icon = LucideIconMap[iconName] || LucideIcons.Image;
  const iconSize = size === "large" ? 96 : size === "medium" ? 64 : 48;

  return (
    <div
      className={`flex flex-col items-center justify-center w-full h-full min-h-[120px] rounded-lg gap-2 ${
        !showRetry ? "animate-pulse" : ""
      }`}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <Icon size={iconSize} className="text-white opacity-60" />
      {showRetry && onRetry && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/30 hover:bg-white/50 text-white text-sm font-medium transition-colors"
        >
          <RotateCw size={14} />
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
