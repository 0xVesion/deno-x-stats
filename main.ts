import {
  MongoClient,
} from "./deps.ts";
import { GithubApi, GithubService } from "./src/github.ts";
import { StatsService } from "./src/stats.ts";
import { RepositoryDb } from "./src/db.ts";

const client = new MongoClient();
client.connectWithUri(Deno.env.get("MONGO_URL") || "");
const db = client.database(Deno.env.get("MONGO_NAME") || "");
const repoDb = new RepositoryDb(db);

const githubApi = new GithubApi(Deno.env.get("GITHUB_TOKEN") || "");
const githubService = new GithubService(githubApi);
const statsService = new StatsService(githubService, repoDb);

while (true) {
  await statsService.importRepos();
  await statsService.importStats();

  await new Promise((res) => setTimeout(res, 1000 * 60 * 15));
}