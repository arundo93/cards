import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { ResolvedVitePWAOptions } from "vite-plugin-pwa";

/** Build-only inspection of Workbox inputs; never reads or rewrites generated JS. */
export async function reportPwaBuild(options: ResolvedVitePWAOptions) {
  const directory = options.workbox.globDirectory;
  if (!directory)
    throw new Error("PWA build requires a local output directory");
  const manifest = JSON.parse(
    await readFile(resolve(directory, options.manifestFilename), "utf8"),
  );
  const reportPath = resolve(directory, "../.reports/pwa-build.json");
  if (manifest.start_url !== "./" || manifest.scope !== "./") {
    throw new Error("PWA start_url and scope must remain relative (./)");
  }

  // Workbox applies additionalManifestEntries AFTER manifestTransforms. Include
  // those plugin-generated icon/manifest entries in the report, without changing
  // the manifest that Workbox receives or duplicating its revision generation.
  options.workbox.manifestTransforms = [
    ...(options.workbox.manifestTransforms ?? []),
    async (entries) => {
      const allEntries = new Map(
        entries.map(({ url, revision }) => [url, { url, revision }]),
      );
      for (const entry of options.workbox.additionalManifestEntries ?? []) {
        if (typeof entry === "string") {
          throw new Error(`PWA asset has no revision: ${entry}`);
        }
        allEntries.set(entry.url, entry);
      }
      for (const required of [
        "index.html",
        options.manifestFilename,
        ...manifest.icons.map((icon: { src: string }) => icon.src),
        "icon.svg",
        "apple-touch-icon.png",
      ]) {
        if (!allEntries.has(required)) {
          throw new Error(`Missing PWA precache asset: ${required}`);
        }
      }
      const precache = await Promise.all(
        [...allEntries.values()]
          .sort((a, b) => a.url.localeCompare(b.url, "en"))
          .map(async ({ url, revision }) => {
            if (/^(?:[a-z]+:|\/)|(?:^|\/)\.\.(?:\/|$)/i.test(url)) {
              throw new Error(`PWA asset must be a local relative URL: ${url}`);
            }
            const file = await stat(resolve(directory, url));
            if (!file.isFile()) throw new Error(`Not a PWA file: ${url}`);
            return { url, revision, bytes: file.size };
          }),
      );
      await mkdir(dirname(reportPath), { recursive: true });
      await writeFile(
        reportPath,
        `${JSON.stringify({ strategy: options.strategies, registerType: options.registerType, serviceWorker: options.filename, manifest, precache }, null, 2)}\n`,
      );
      return { manifest: entries };
    },
  ];
}
