export interface EntityStorage<T> {
  put(item: T): Promise<any>;
  update(item: Partial<T>): Promise<any>;
  get(item: Partial<T>): Promise<{ Item: T | undefined }>;
  delete(item: Partial<T>): Promise<void>;
  scan(): Promise<{ Items: T[] }>;
}
