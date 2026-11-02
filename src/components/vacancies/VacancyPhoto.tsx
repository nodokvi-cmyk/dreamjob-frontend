import { cn } from "@/lib/utils";

interface VacancyPhotoProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function VacancyPhoto({ src, alt, width, height, priority = false, className }: VacancyPhotoProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn("block h-full w-full bg-muted object-cover", className)}
    />
  );
}
