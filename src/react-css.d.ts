import "react";

declare module "react" {
  interface CSSProperties {
    "--font-stack-sans"?: string;
    "--font-stack-display"?: string;
  }
}
