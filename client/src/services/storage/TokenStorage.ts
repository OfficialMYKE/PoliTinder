/**
 * Token Storage Service - ISP & DIP
 * Depends on abstraction (IStorageAdapter) not concrete implementation
 */

import { ITokenStorage } from "./ITokenStorage";
import { IStorageAdapter } from "./IStorageAdapter";

export class TokenStorage implements ITokenStorage {
  private readonly tokenKey = "auth_token";
  private storage: IStorageAdapter;

  constructor(storageAdapter: IStorageAdapter) {
    this.storage = storageAdapter;
  }

  setToken(token: string): void {
    this.storage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return this.storage.getItem(this.tokenKey);
  }

  removeToken(): void {
    this.storage.removeItem(this.tokenKey);
  }
}
