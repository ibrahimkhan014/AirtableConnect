import { type AirtableConfig } from "@shared/schema";

export interface IStorage {
  getAirtableConfig(): Promise<AirtableConfig | undefined>;
  saveAirtableConfig(config: AirtableConfig): Promise<void>;
}

export class MemStorage implements IStorage {
  private config: AirtableConfig | undefined;

  constructor() {
    this.config = undefined;
  }

  async getAirtableConfig(): Promise<AirtableConfig | undefined> {
    return this.config;
  }

  async saveAirtableConfig(config: AirtableConfig): Promise<void> {
    this.config = config;
  }
}

export const storage = new MemStorage();
