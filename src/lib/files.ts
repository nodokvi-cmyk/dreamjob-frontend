export const MAX_UPLOAD_MB = 4;

export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const MAX_UPLOAD_LABEL = `${MAX_UPLOAD_MB} MB`;

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const IMAGE_ACCEPT = IMAGE_TYPES.join(",");

export const PDF_ACCEPT = "application/pdf,.pdf";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sizeProblem(file: File): string | null {
  if (file.size === 0) return "That file is empty. Choose another one.";
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That file is ${formatBytes(file.size)}. The limit is ${MAX_UPLOAD_LABEL}.`;
  }
  return null;
}

export function imageProblem(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return "Choose a JPEG, PNG or WebP image.";
  return sizeProblem(file);
}

export function pdfProblem(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Choose a PDF file.";
  return sizeProblem(file);
}
