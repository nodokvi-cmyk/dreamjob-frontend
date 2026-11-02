"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { imageProblem } from "@/lib/files";
import { LIMITS } from "@/lib/vacancyForm";
import type { VacancyPhoto } from "@/types";

export type UploadState = "waiting" | "uploading" | "done" | "failed";

export type PhotoItem =
  | { kind: "saved"; key: string; id: string; url: string; remove: boolean }
  | {
      kind: "new";
      key: string;
      file: File;
      url: string;
      state: UploadState;
      progress: number;
      error: string | null;
    };

export type NewPhoto = Extract<PhotoItem, { kind: "new" }>;

type NewChange = Partial<Pick<NewPhoto, "state" | "progress" | "error">>;

export function countsTowardCap(item: PhotoItem): boolean {
  return item.kind === "new" || !item.remove;
}

export function usePhotoItems(saved: readonly VacancyPhoto[]) {
  const [items, setItems] = useState<PhotoItem[]>(() =>
    saved.map((photo) => ({ kind: "saved", key: photo.id, id: photo.id, url: photo.url, remove: false })),
  );
  const urls = useRef(new Set<string>());
  const counter = useRef(0);

  useEffect(() => {
    const owned = urls.current;
    return () => {
      for (const url of owned) URL.revokeObjectURL(url);
      owned.clear();
    };
  }, []);

  const add = useCallback(
    (files: readonly File[]): string[] => {
      const problems: string[] = [];
      const room = LIMITS.photos - items.filter(countsTowardCap).length;
      const accepted: NewPhoto[] = [];
      for (const file of files) {
        const issue = imageProblem(file);
        if (issue) {
          problems.push(`${file.name}: ${issue}`);
          continue;
        }
        if (accepted.length >= room) {
          problems.push(`A vacancy can have up to ${LIMITS.photos} photos. ${file.name} was left out.`);
          continue;
        }
        counter.current += 1;
        const url = URL.createObjectURL(file);
        urls.current.add(url);
        accepted.push({
          kind: "new",
          key: `new-${counter.current}`,
          file,
          url,
          state: "waiting",
          progress: 0,
          error: null,
        });
      }
      if (accepted.length > 0) setItems((current) => [...current, ...accepted]);
      return problems;
    },
    [items],
  );

  const discard = useCallback((key: string) => {
    setItems((current) => {
      const item = current.find((entry) => entry.key === key);
      if (item?.kind === "new") {
        URL.revokeObjectURL(item.url);
        urls.current.delete(item.url);
      }
      return current.filter((entry) => entry.key !== key);
    });
  }, []);

  const toggleRemove = useCallback((key: string) => {
    setItems((current) =>
      current.map((entry) => (entry.kind === "saved" && entry.key === key ? { ...entry, remove: !entry.remove } : entry)),
    );
  }, []);

  const update = useCallback((key: string, change: NewChange) => {
    setItems((current) =>
      current.map((entry) => (entry.kind === "new" && entry.key === key ? { ...entry, ...change } : entry)),
    );
  }, []);

  return { items, add, discard, toggleRemove, update };
}
