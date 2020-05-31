import { Api } from "./core.ts";

export interface GithubRepository {
  created_at: Date;
  updated_at: Date;
  pushed_at: Date;
  size: number;
  stargazers_count: number;
  forks: number;
  open_issues: number;
  watchers: number;
}

export class GithubApi extends Api {
  private readonly version: number;

  public constructor(authorization: string, version: number = 3) {
    super(
      "https://api.github.com",
      authorization ? `token ${authorization}` : "",
    );

    this.version = version;
  }

  protected fetch(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    return super.fetch(path, {
      headers: {
        Accept: `application/vnd.github.v${this.version}+json`,
        ...(init?.headers || {}),
      },
    });
  }

  public async getFileContent(
    user: string,
    repo: string,
    path: string,
    branch: string = "master",
  ): Promise<string> {
    if (path.startsWith("/")) path = path.substring(1);

    return (await fetch(
      `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`,
    ))
      .json();
  }

  public async getRepository(
    user: string,
    repo: string,
  ): Promise<GithubRepository> {
    return this
      .fetch(`/repos/${user}/${repo}`)
      .then((r) => r.json())
      .then((json) => json as GithubRepository);
  }
}

export class GithubService {
  private readonly api: GithubApi;

  public constructor(api: GithubApi) {
    this.api = api;
  }

  public async getFile(user: string, repo: string, path: string): Promise<any> {
    return this.api.getFileContent(user, repo, path);
  }

  public async getRepository(
    user: string,
    repo: string,
  ): Promise<GithubRepository> {
    return this.api.getRepository(user, repo);
  }
}
