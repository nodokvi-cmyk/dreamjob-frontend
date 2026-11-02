"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PickedFile {
  file: File;
  url: string;
}

export function usePickedFile() {
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const urlRef = useRef<string | null>(null);

  const pick = useCallback((file: File | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = file ? URL.createObjectURL(file) : null;
    urlRef.current = url;
    setPicked(file && url ? { file, url } : null);
  }, []);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return { picked, pick };
}
