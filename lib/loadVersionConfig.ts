import { readFileSync } from 'fs';
import { join } from 'path';
import { VersionConfigSchema, type VersionConfig } from './versionSchema';

const DEFAULT_VERSION = 'warm';

// Allowlist of valid version IDs — prevents path traversal
const ALLOWED_VERSIONS = ['classic', 'minimal', 'warm'] as const;

export type LoadResult =
  | { success: true; data: VersionConfig }
  | { success: false; error: string };

/** Rejects any ID that contains path separators or unusual characters. */
function sanitizeVersionId(input: string): string | null {
  if (/^[a-z0-9-_]{1,64}$/.test(input)) return input;
  return null;
}

function readVersionFile(versionId: string): LoadResult {
  const safe = sanitizeVersionId(versionId);
  if (!safe) {
    return { success: false, error: `Invalid version ID: "${versionId}".` };
  }

  const filePath = join(process.cwd(), 'data', 'versions', `${safe}.json`);

  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf-8');
  } catch {
    return {
      success: false,
      error: `Version config file not found: data/versions/${safe}.json`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      success: false,
      error: `data/versions/${safe}.json is not valid JSON.`,
    };
  }

  const result = VersionConfigSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.') || 'root'}: ${i.message}`)
      .join('; ');
    return { success: false, error: `Config validation failed — ${issues}` };
  }

  return { success: true, data: result.data };
}

/**
 * Resolves the active version config:
 * 1. URL preview param `?v=` (development use only)
 * 2. Environment variable NEXT_PUBLIC_INVITE_VERSION
 * 3. Fallback to "classic"
 */
export function loadVersionConfig(previewVersion?: string): LoadResult {
  if (previewVersion) {
    const safe = sanitizeVersionId(previewVersion);
    if (safe && (ALLOWED_VERSIONS as readonly string[]).includes(safe)) {
      return readVersionFile(safe);
    }
  }

  const envVersion = process.env.NEXT_PUBLIC_INVITE_VERSION;
  if (envVersion) {
    const safe = sanitizeVersionId(envVersion);
    if (safe && (ALLOWED_VERSIONS as readonly string[]).includes(safe)) {
      return readVersionFile(safe);
    }
  }

  return readVersionFile(DEFAULT_VERSION);
}
