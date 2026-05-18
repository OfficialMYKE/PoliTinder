/**
 * Storage Services Barrel Export
 */

export { LocalStorageAdapter } from "./LocalStorageAdapter";
export { TokenStorage } from "./TokenStorage";
export { UserStorage } from "./UserStorage";
export type { IStorageAdapter } from "./IStorageAdapter";
export type { ITokenStorage } from "./ITokenStorage";
export type { IUserStorage } from "./IUserStorage";

// Factory function for creating storage instances - DIP
import { IStorageAdapter } from "./IStorageAdapter";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { TokenStorage } from "./TokenStorage";
import { UserStorage } from "./UserStorage";

export function createStorageServices(adapter?: IStorageAdapter) {
  const storageAdapter = adapter || new LocalStorageAdapter();
  return {
    tokenStorage: new TokenStorage(storageAdapter),
    userStorage: new UserStorage(storageAdapter),
  };
}
