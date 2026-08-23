import { dirname, fromFileUrl, join } from "@std/path";

/**
 * Converts any path relative to workspace root and returns its absolute url.
 *
 * @param relativePath The path relative to workspace root
 * @returns The absolute path
 */
export const fromRoot = (relativePath: string) => {
  const scriptDir = dirname(fromFileUrl(import.meta.url));
  return join(scriptDir, "..", "..", relativePath);
};
