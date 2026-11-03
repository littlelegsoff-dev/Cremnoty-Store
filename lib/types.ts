export type Release = {
  version: string;
  versionCode: number;
  date: string | null;
  size: number | null;
  file: string | null;
  url: string | null;
  sha256: string | null;
  minSdk: number | null;
  targetSdk: number | null;
  changelog: string | null;
  downloadUrl: string | null;
};

export type AppRecord = {
  id: string;
  packageId: string;
  name: string;
  summary: string;
  description: string;
  version: string;
  versionCode: number;
  developer: string;
  developerUrl: string | null;
  license: string;
  website: string | null;
  sourceCode: string | null;
  issueTracker: string | null;
  donate: string | null;
  categories: string[];
  tags: string[];
  iconUrl: string;
  screenshots: string[];
  addedAt: string | null;
  updatedAt: string;
  featured: boolean;
  free: boolean;
  antiFeatures: string[];
  permissions: string[];
  releases: Release[];
  size: number | null;
  sha256: string | null;
  minSdk: number | null;
  targetSdk: number | null;
};

export type AppSummary = Omit<
  AppRecord,
  'description' | 'releases' | 'permissions' | 'antiFeatures'
> & {
  releaseCount: number;
};

export type CatalogPayload = {
  apps: AppSummary[];
  categories: { name: string; count: number }[];
  generatedAt: string;
};
