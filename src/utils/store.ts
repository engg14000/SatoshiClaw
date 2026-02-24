import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export class JSONStore<T> {
  private filePath: string;
  private data: T;

  constructor(filename: string, defaultData: T) {
    this.filePath = path.resolve(process.cwd(), filename);
    this.data = defaultData;
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(content);
        logger.info(`Loaded store from ${this.filePath}`);
      } else {
        logger.info(`Creating new store at ${this.filePath}`);
        this.save();
      }
    } catch (error) {
      logger.error(`Failed to load store ${this.filePath}:`, error);
    }
  }

  public save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      logger.error(`Failed to save store ${this.filePath}:`, error);
    }
  }

  public get(): T {
    return this.data;
  }

  public update(updater: (data: T) => void) {
    updater(this.data);
    this.save();
  }
}
