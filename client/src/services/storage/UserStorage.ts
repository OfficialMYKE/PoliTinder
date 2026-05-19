/**
 * Servicio de almacenamiento de usuario — ISP y DIP
 * Depende de la abstracción IStorageAdapter, no de una implementación concreta
 */

import { IUserStorage } from "./IUserStorage";
import { IStorageAdapter } from "./IStorageAdapter";

export class UserStorage implements IUserStorage {
  private readonly userKey = "auth_user";
  private storage: IStorageAdapter;

  constructor(storageAdapter: IStorageAdapter) {
    this.storage = storageAdapter;
  }

  setUser(user: unknown): void {
    this.storage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): unknown | null {
    const user = this.storage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  removeUser(): void {
    this.storage.removeItem(this.userKey);
  }
}
