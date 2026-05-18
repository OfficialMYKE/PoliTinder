/**
 * Storage Adapter Interface - DIP (Dependency Inversion Principle)
 * Abstraction that high-level modules depend on
 */

export interface IStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}
