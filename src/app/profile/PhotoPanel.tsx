"use client";

import { ImageUpIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useId, useRef, type ChangeEvent } from "react";
import { FormAlert } from "@/components/form/FormAlert";
import { AccountPhoto } from "@/components/profile/AccountPhoto";
import { Notice } from "@/components/profile/SaveRow";
import { useAction } from "@/components/profile/useAction";
import { usePickedFile } from "@/components/profile/usePickedFile";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { problem } from "@/lib/errors";
import { formatBytes, IMAGE_ACCEPT, imageProblem, MAX_UPLOAD_LABEL } from "@/lib/files";

interface PhotoPanelProps {
  kind: "avatar" | "logo";
  src: string;
  name: string;
  upload: (file: File) => Promise<unknown>;
  remove: () => Promise<unknown>;
}

const COPY = {
  avatar: { noun: "photo", choose: "Choose photo", alt: "Your profile photo" },
  logo: { noun: "logo", choose: "Choose logo", alt: "Your company logo" },
};

export function PhotoPanel({ kind, src, name, upload, remove }: PhotoPanelProps) {
  const { refresh } = useAuth();
  const { pending, error, notice, run, fail, reset } = useAction();
  const { picked, pick } = usePickedFile();
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const copy = COPY[kind];
  const fit = kind === "avatar" ? "cover" : "contain";

  function handleChoose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    const issue = imageProblem(file);
    if (issue) {
      pick(null);
      fail(problem(issue));
      return;
    }
    reset();
    pick(file);
  }

  async function handleUpload() {
    if (!picked) return;
    const file = picked.file;
    await run(async () => {
      await upload(file);
      await refresh();
      pick(null);
      return kind === "avatar" ? "Photo updated." : "Logo updated.";
    });
  }

  async function handleRemove() {
    await run(async () => {
      await remove();
      await refresh();
      return kind === "avatar" ? "Photo removed." : "Logo removed.";
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
        <div className="relative w-fit">
          {picked ? (
            <AccountPhoto
              src={picked.url}
              name={name}
              alt={`Preview of your new ${copy.noun}`}
              size="lg"
              fit={fit}
              className="border-2 border-dashed border-line-cobalt"
            />
          ) : (
            <AccountPhoto src={src} name={name} alt={copy.alt} size="lg" fit={fit} />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          {picked ? (
            <div className="text-sm">
              <p className="font-semibold">Preview, not uploaded yet</p>
              <p className="tabular break-all text-muted-foreground">
                {picked.file.name} · {formatBytes(picked.file.size)}
              </p>
            </div>
          ) : (
            <p id={hintId} className="text-sm text-muted-foreground">
              JPEG, PNG or WebP, up to {MAX_UPLOAD_LABEL}.{" "}
              {kind === "avatar" ? "We crop it to a square." : "We fit it inside a square, never stretched."}
            </p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleChoose}
            tabIndex={-1}
            aria-hidden
            className="sr-only"
          />
          <div className="flex flex-wrap gap-2">
            {picked ? (
              <>
                <Button type="button" onClick={handleUpload} disabled={pending}>
                  <UploadIcon aria-hidden />
                  {pending ? "Uploading" : `Upload ${copy.noun}`}
                </Button>
                <Button type="button" variant="outline" onClick={() => pick(null)} disabled={pending}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                  disabled={pending}
                  aria-describedby={hintId}
                >
                  <ImageUpIcon aria-hidden />
                  {src ? `Replace ${copy.noun}` : copy.choose}
                </Button>
                {src ? (
                  <Button type="button" variant="destructive" onClick={handleRemove} disabled={pending}>
                    <Trash2Icon aria-hidden />
                    {pending ? "Removing" : "Remove"}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
      <Notice message={notice} />
      {error ? <FormAlert tone="error" message={error.message} details={error.details} /> : null}
    </div>
  );
}
