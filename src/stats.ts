import { GithubService } from "./github.ts";
import { RepositoryDb } from "./db.ts";
import { DenoXEntry, Repository, RepositoryStats } from "./model.ts";

export class StatsService {
  public readonly github: GithubService;
  public readonly db: RepositoryDb;

  public constructor(github: GithubService, db: RepositoryDb) {
    this.github = github;
    this.db = db;
  }

  public async getEntries(): Promise<DenoXEntry[]> {
    return Object
      .entries(
        await this.github.getFile(
          "denoland",
          "deno_website2",
          "/database.json",
        ),
      )
      .map(([name, entry]) => ({ ...entry as any, name }) as DenoXEntry);
  }

  public async importRepos() {
    const oldEntries = await this.db.find();
    const newEntries = (await this.getEntries())
      .filter((e) =>
        oldEntries.filter((ee) =>
          ee.owner === e.owner && ee.repository === e.repo
        )
          .length === 0
      )
      .map((entry) =>
        ({
          name: entry.name || "",
          owner: entry.owner,
          repository: entry.repo,
          description: entry.desc,
          createdDate: new Date().toISOString(),
          stats: [],
        }) as Repository
      );

    if (newEntries.length === 0) return;

    this.db.insertMany(newEntries);
  }

  public async getStats(repo: Repository): Promise<RepositoryStats> {
    const r = await this.github.getRepository(repo.owner, repo.repository);

    return {
      createdDate: new Date().toISOString(),
      size: r.size,
      stars: r.stargazers_count,
      forks: r.forks,
      issues: r.open_issues,
      watchers: r.watchers,
    };
  }
}
