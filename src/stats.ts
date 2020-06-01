import { GithubService, GithubRepository } from "./github.ts";
import { RepositoryDb } from "./db.ts";
import { DenoXEntry, Repository, RepositoryStats } from "./model.ts";

export class StatsService {
  public readonly github: GithubService;
  public readonly db: RepositoryDb;
  public readonly hours: number = 4;

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
      );

    console.log(`Found ${newEntries.length} new repos!`);

    for (const entry of newEntries) {
      let r: GithubRepository | null = null;

      try {
        r = await this.github.getRepository(entry.owner, entry.repo);
      } catch (e) {
        console.log(`Couldn't find ${entry.name}!`);
        console.error(e);
      }

      const repository = {
        name: entry.name || "",
        owner: entry.owner,
        repository: entry.repo,
        description: entry.desc,
        createdDate: r ? new Date(r.created_at).toISOString() : null,
        stats: [],
      } as Repository;

      console.log(`Creating new entry for ${entry.owner}/${entry.repo}...`);

      await this.db.insertMany([repository]);
    }

    console.log(`Finished importing repos!`);
  }

  public async getStats(user: string, repo: string): Promise<RepositoryStats> {
    const r = await this.github.getRepository(user, repo);

    return {
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date(r.updated_at).toISOString(),
      size: r.size,
      stars: r.stargazers_count,
      forks: r.forks,
      issues: r.open_issues,
      watchers: r.watchers,
    };
  }

  public async importStats(): Promise<void> {
    console.log(`Running stats update...`);

    for (const entry of await this.db.find()) {
      if (entry.createdDate === null) continue;

      if (entry.stats.length > 0) {
        const lastEntry = entry.stats[entry.stats.length - 1];
        const lastEntryMillis = new Date().getTime() - new Date(lastEntry.createdDate).getTime();

        if (lastEntryMillis < this.hours * 60 * 60 * 1000) continue;
      }
      console.log(`Updating stats for ${entry.owner}/${entry.repository}...`);

      const stats = await this.getStats(entry.owner, entry.repository);

      await this.db.updateOne(
        { _id: (entry as any)._id },
        { $push: { stats: stats } },
      );
    }

    console.log(`Finished stats update!`);
  }
}
