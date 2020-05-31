export interface DenoXEntry {
  name?: string;
  type: DenoXEntryType;
  owner: string;
  repo: string;
  desc: string;
  path?: string;
  defaultVersion?: string;
}

export enum DenoXEntryType {
  Github = "github",
}

export interface RepositoryStats {
  createdDate: string;
  size: number;
  stars: number;
  forks: number;
  issues: number;
  watchers: number;
}

export interface Repository {
  name: string;
  owner: string;
  repository: string;
  description: string;
  createdDate: string;
  stats: RepositoryStats[];
}
