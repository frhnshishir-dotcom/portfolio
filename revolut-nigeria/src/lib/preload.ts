/**
 * Byte-accurate asset preloading.
 *
 * Each asset is streamed with fetch so the preloader can report real progress
 * (bytes received over bytes expected) instead of counting finished files.
 * The bytes are kept as a Blob and handed to the page as an object URL, so the
 * photograph is downloaded exactly once.
 */

export type AssetSpec = {
  url: string;
  /** Used until the server's Content-Length is known, or when it is missing. */
  expectedBytes: number;
};

export type LoadedAsset = {
  /** Object URL for the downloaded bytes (falls back to the original URL). */
  src: string;
  /** Release the object URL. */
  dispose: () => void;
};

type Progress = (ratio: number) => void;

async function streamOne(
  spec: AssetSpec,
  signal: AbortSignal,
  report: (loaded: number, total: number) => void,
): Promise<LoadedAsset> {
  let src = spec.url;
  let dispose = () => {};

  try {
    const response = await fetch(spec.url, { signal });
    if (!response.ok) throw new Error(`${response.status} for ${spec.url}`);

    const header = Number(response.headers.get('content-length'));
    const total = Number.isFinite(header) && header > 0 ? header : spec.expectedBytes;
    const type = response.headers.get('content-type') ?? undefined;

    let blob: Blob;
    if (response.body) {
      const reader = response.body.getReader();
      const chunks: Uint8Array<ArrayBuffer>[] = [];
      let loaded = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        report(loaded, Math.max(total, loaded));
      }
      blob = new Blob(chunks, type ? { type } : undefined);
      report(loaded, loaded);
    } else {
      blob = await response.blob();
      report(blob.size, blob.size);
    }

    const objectUrl = URL.createObjectURL(blob);
    src = objectUrl;
    dispose = () => URL.revokeObjectURL(objectUrl);
  } catch (error) {
    if (signal.aborted) throw error;
    // No streaming (file://, an opaque response, a strict CSP): let <img> load it.
    report(spec.expectedBytes, spec.expectedBytes);
  }

  // Decode before the intro starts so the first frame never shows a blank image.
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
  try {
    await image.decode();
  } catch {
    /* a failed decode surfaces as a broken image, not a stuck preloader */
  }
  if (signal.aborted) {
    dispose();
    throw new DOMException('Aborted', 'AbortError');
  }
  return { src, dispose };
}

/** Load every asset in parallel, reporting combined byte progress in [0, 1]. */
export async function preloadAssets<K extends string>(
  specs: Record<K, AssetSpec>,
  onProgress: Progress,
  signal: AbortSignal,
): Promise<Record<K, LoadedAsset>> {
  const keys = Object.keys(specs) as K[];
  const loaded = new Map<K, number>();
  const totals = new Map<K, number>(keys.map((key) => [key, specs[key].expectedBytes]));

  const emit = () => {
    let sumLoaded = 0;
    let sumTotal = 0;
    for (const key of keys) {
      sumLoaded += loaded.get(key) ?? 0;
      sumTotal += totals.get(key) ?? 0;
    }
    onProgress(sumTotal > 0 ? Math.min(sumLoaded / sumTotal, 1) : 0);
  };

  const results = await Promise.allSettled(
    keys.map((key) =>
      streamOne(specs[key], signal, (bytes, total) => {
        loaded.set(key, bytes);
        totals.set(key, total);
        emit();
      }),
    ),
  );

  const assets = {} as Record<K, LoadedAsset>;
  let failure: unknown;
  results.forEach((result, index) => {
    const key = keys[index]!;
    if (result.status === 'fulfilled') assets[key] = result.value;
    else failure ??= result.reason;
  });
  if (failure !== undefined) {
    // One asset was aborted or failed: release whatever the others allocated.
    for (const key of keys) assets[key]?.dispose();
    throw failure;
  }
  onProgress(1);
  return assets;
}
