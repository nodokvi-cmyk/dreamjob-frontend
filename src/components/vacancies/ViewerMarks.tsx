"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { apiSearch } from "@/lib/vacancyQuery";
import { getVacancyForViewer, listVacanciesForViewer } from "@/services/vacancies.service";
import type { VacancyQuery, ViewerMarks } from "@/types";

export type Viewer = "loading" | "anonymous" | "user" | "other";

export type MarksSource =
  | { kind: "list"; query: VacancyQuery; take: number }
  | { kind: "detail"; id: string }
  | { kind: "none" };

type MarksMap = ReadonlyMap<string, ViewerMarks>;

interface Keyed {
  key: string;
  map: MarksMap;
}

interface PatchKeyed {
  key: string;
  map: ReadonlyMap<string, Partial<ViewerMarks>>;
}

interface ViewerMarksValue {
  viewer: Viewer;
  ready: boolean;
  marksFor: (id: string, fallback: ViewerMarks) => ViewerMarks;
  update: (id: string, patch: Partial<ViewerMarks>) => void;
}

const ViewerMarksContext = createContext<ViewerMarksValue | null>(null);

function marksOf(item: ViewerMarks & { id: string }): [string, ViewerMarks] {
  return [
    item.id,
    { companyApproved: item.companyApproved, myApplication: item.myApplication, isBookmarked: item.isBookmarked },
  ];
}

function sourceKey(source: MarksSource): string {
  if (source.kind === "list") return `list:${apiSearch(source.query, source.take)}`;
  if (source.kind === "detail") return `detail:${source.id}`;
  return "none";
}

async function loadMarks(source: MarksSource, signal: AbortSignal): Promise<MarksMap> {
  if (source.kind === "list") {
    const page = await listVacanciesForViewer(source.query, source.take, signal);
    return new Map(page.items.map(marksOf));
  }
  if (source.kind === "detail") {
    return new Map([marksOf(await getVacancyForViewer(source.id, signal))]);
  }
  return new Map();
}

export function ViewerMarksProvider({ source, children }: { source: MarksSource; children: ReactNode }) {
  const { status, session } = useAuth();
  const viewer: Viewer =
    status === "loading"
      ? "loading"
      : status === "anonymous"
        ? "anonymous"
        : status === "authenticated" && session?.accountRole === "user"
          ? "user"
          : "other";
  const accountId = viewer === "user" && session ? session.accountId : null;
  const key = accountId && source.kind !== "none" ? `${accountId}|${sourceKey(source)}` : null;

  const [loaded, setLoaded] = useState<Keyed | null>(null);
  const [overrides, setOverrides] = useState<PatchKeyed | null>(null);
  const run = useEffectEvent(loadMarks);
  const currentSource = useEffectEvent(() => source);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    run(currentSource(), controller.signal).then(
      (map) => setLoaded({ key, map }),
      () => {
        if (!controller.signal.aborted) setLoaded({ key, map: new Map() });
      },
    );
    return () => controller.abort();
  }, [key]);

  const loadedMap = key && loaded?.key === key ? loaded.map : null;
  const overrideKey = key ?? "anonymous";
  const overrideMap = overrides?.key === overrideKey ? overrides.map : null;
  const ready = viewer !== "loading" && (viewer !== "user" || source.kind === "none" || loadedMap !== null);

  const marksFor = useCallback(
    (id: string, fallback: ViewerMarks): ViewerMarks => ({
      ...fallback,
      ...loadedMap?.get(id),
      ...overrideMap?.get(id),
    }),
    [loadedMap, overrideMap],
  );

  const update = useCallback(
    (id: string, patch: Partial<ViewerMarks>) => {
      setOverrides((current) => {
        const base = current?.key === overrideKey ? current.map : new Map<string, Partial<ViewerMarks>>();
        const next = new Map(base);
        const previous = next.get(id);
        next.set(id, { ...previous, ...patch });
        return { key: overrideKey, map: next };
      });
    },
    [overrideKey],
  );

  const value = useMemo(() => ({ viewer, ready, marksFor, update }), [viewer, ready, marksFor, update]);

  return <ViewerMarksContext value={value}>{children}</ViewerMarksContext>;
}

export function useViewerMarks(): ViewerMarksValue {
  const value = use(ViewerMarksContext);
  if (!value) throw new Error("useViewerMarks needs a ViewerMarksProvider");
  return value;
}
