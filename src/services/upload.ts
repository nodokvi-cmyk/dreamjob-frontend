import { API_URL, apiErrorFrom, currentToken, networkError, parseBody } from "@/services/api";

export interface UploadOptions {
  token?: string | null;
  signal?: AbortSignal;
  onProgress?: (fraction: number) => void;
}

export function uploadWithProgress<T>(
  path: string,
  body: FormData,
  parse: (data: unknown) => T,
  options: UploadOptions = {},
): Promise<T> {
  const { signal, onProgress } = options;
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("The upload was cancelled.", "AbortError"));
      return;
    }
    const request = new XMLHttpRequest();
    request.open("POST", `${API_URL}${path}`);
    request.setRequestHeader("Accept", "application/json");
    const token = currentToken(options.token);
    if (token) request.setRequestHeader("Authorization", `Bearer ${token}`);

    const abort = () => request.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const settle = () => signal?.removeEventListener("abort", abort);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) onProgress?.(event.loaded / event.total);
    };
    request.onload = () => {
      settle();
      const data = parseBody(request.responseText);
      if (request.status < 200 || request.status >= 300) {
        reject(apiErrorFrom(request.status, data));
        return;
      }
      try {
        resolve(parse(data));
      } catch (error: unknown) {
        reject(error);
      }
    };
    request.onerror = () => {
      settle();
      reject(networkError());
    };
    request.onabort = () => {
      settle();
      reject(new DOMException("The upload was cancelled.", "AbortError"));
    };
    request.send(body);
  });
}
