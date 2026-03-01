import React from "react";
import * as LucideIcons from "lucide-react";

export interface ImagePlaceholderProps {
  gradientFrom: string;
  gradientTo: string;
  iconName: string;
  size?: "small" | "medium" | "large";
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
}: ImagePlaceholderProps) {
  const Icon = LucideIconMap[iconName] || LucideIcons.Image;
  const iconSize = size === "large" ? 96 : size === "medium" ? 64 : 48;

  return (
    <div
      className="flex items-center justify-center animate-pulse w-full h-full min-h-[120px] rounded-lg"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <Icon size={iconSize} className="text-white opacity-60" />
    </div>
  );
}
