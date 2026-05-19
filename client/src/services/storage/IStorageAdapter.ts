/**
 * Adaptador de almacenamiento — DIP (Principio de Inversión de Dependencias)
 * Abstracción de la que dependen los módulos de alto nivel
 */

export interface IStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}
