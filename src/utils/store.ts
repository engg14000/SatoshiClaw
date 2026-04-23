import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export class JSONStore<T> {
  private filePath: string;
  private data: T;

  public ready: Promise<void>;

  constructor(filename: string, defaultData: T) {
    this.filePath = path.resolve(process.cwd(), filename);
    this.data = defaultData;
    this.ready = this.load();
  }

  private async load(): Promise<void> {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = await fs.promises.readFile(this.filePath, 'utf-8');
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
    const tempPath = `${this.filePath}.tmp`;
    try {
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2));
      fs.renameSync(tempPath, this.filePath);
    } catch (error) {
      logger.error(`Failed to save store ${this.filePath}:`, error);
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (unlinkError) {
          logger.error(`Failed to clean up temporary file ${tempPath}:`, unlinkError);
        }
      }
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
