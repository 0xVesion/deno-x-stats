import { MongoDatabase } from "../deps.ts";
import { Repository } from "./model.ts";
import { DbBase } from "./core.ts";

export class RepositoryDb extends DbBase<Repository> {
  public constructor(db: MongoDatabase) {
    super("repos", db);
  }
}
