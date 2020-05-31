import { MongoDatabase, MongoCollection } from "../deps.ts";

export abstract class DbBase<T> {
  public readonly name: string;
  protected readonly collection: MongoCollection;

  public constructor(name: string, db: MongoDatabase) {
    this.name = name;
    this.collection = db.collection(name);
  }

  public async insertMany(entries: T[]): Promise<void> {
    await this.collection.insertMany(entries);
  }

  public async find(query?: Object): Promise<T[]> {
    return this.collection.find(query);
  }

  public async updateOne(query: Object, update: Object): Promise<void> {
    await this.collection.updateOne(query, update);
  }
}

export abstract class Api {
  private readonly baseUrl: string;
  private readonly authorization: string;

  public constructor(baseUrl: string, authorization: string = "") {
    this.baseUrl = baseUrl;
    this.authorization = authorization;
  }

  protected async fetch(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: this.authorization,
        ...(init?.headers || {}),
      },
    });

    if (response.status > 299) {
      throw Error(
        `HTTP Error: ${response.status}, ${
          JSON.stringify(await response.json())
        }`,
      );
    }

    return response;
  }
}
