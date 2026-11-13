import { DefaultPicture, type PictureKind } from "@/components/profile/DefaultPicture";
import { cn } from "@/lib/utils";

export type PhotoSize = "xs" | "sm" | "row" | "tile" | "md" | "lg";

const PIXELS: Record<PhotoSize, number> = { xs: 28, sm: 32, row: 48, tile: 56, md: 72, lg: 128 };

const BOX: Record<PhotoSize, string> = {
  xs: "size-7 rounded-[7px]",
  sm: "size-8 rounded-md",
  row: "size-12 rounded-[10px]",
  tile: "size-14 rounded-[12px]",
  md: "size-[72px] rounded-[14px]",
  lg: "size-32 rounded-[17px]",
};

const PADDING: Record<PhotoSize, string> = {
  xs: "p-0.5",
  sm: "p-0.5",
  row: "p-1",
  tile: "p-1.5",
  md: "p-2",
  lg: "p-2",
};

interface AccountPhotoProps {
  src: string;
  kind: PictureKind;
  alt: string;
  size: PhotoSize;
  fit: "cover" | "contain";
  className?: string;
}

export function AccountPhoto({ src, kind, alt, size, fit, className }: AccountPhotoProps) {
  if (!src) return <DefaultPicture kind={kind} label={alt} className={cn(BOX[size], className)} />;
  return (
    <img
      src={src}
      alt={alt}
      width={PIXELS[size]}
      height={PIXELS[size]}
      decoding="async"
      className={cn(
        "shrink-0 border border-border",
        BOX[size],
        fit === "cover" ? "object-cover" : cn("bg-white object-contain", PADDING[size]),
        className,
      )}
    />
  );
}
