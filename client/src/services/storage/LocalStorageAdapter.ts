/**
 * Adaptador concreto de LocalStorage — DIP (Principio de Inversión de Dependencias)
 * Implementación que encapsula la API nativa de localStorage del navegador
 */

import { IStorageAdapter } from "./IStorageAdapter";

export class LocalStorageAdapter implements IStorageAdapter {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
