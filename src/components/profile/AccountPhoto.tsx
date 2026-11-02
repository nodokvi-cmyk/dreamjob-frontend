import { initials } from "@/lib/account";
import { cn } from "@/lib/utils";

type PhotoSize = "md" | "lg";

const PIXELS: Record<PhotoSize, number> = { md: 72, lg: 128 };

const BOX: Record<PhotoSize, string> = {
  md: "size-[72px] rounded-[14px] text-2xl",
  lg: "size-32 rounded-[17px] text-5xl",
};

interface AccountPhotoProps {
  src: string;
  name: string;
  alt: string;
  size: PhotoSize;
  fit: "cover" | "contain";
  className?: string;
}

export function AccountPhoto({ src, name, alt, size, fit, className }: AccountPhotoProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width={PIXELS[size]}
        height={PIXELS[size]}
        decoding="async"
        className={cn(
          "shrink-0 border border-border bg-card",
          BOX[size],
          fit === "cover" ? "object-cover" : "object-contain p-2",
          className,
        )}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={alt}
      className={cn(
        "grid shrink-0 place-items-center border-b-4 border-line-scarlet bg-enamel font-display leading-none font-bold tracking-[0.02em] text-on-enamel dark:ring-1 dark:ring-enamel-seam",
        BOX[size],
        className,
      )}
    >
      <span aria-hidden>{initials(name)}</span>
    </span>
  );
}
