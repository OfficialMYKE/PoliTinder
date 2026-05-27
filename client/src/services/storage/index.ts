export { LocalStorageAdapter } from "./LocalStorageAdapter"
export { TokenStorage } from "./TokenStorage"
export { UserStorage } from "./UserStorage"
export { OnboardingStorage } from "./OnboardingStorage"
export type { IStorageAdapter } from "./IStorageAdapter"
export type { ITokenStorage } from "./ITokenStorage"
export type { IUserStorage } from "./IUserStorage"
export type { IOnboardingStorage } from "./IOnboardingStorage"

import { IStorageAdapter } from "./IStorageAdapter"
import { LocalStorageAdapter } from "./LocalStorageAdapter"
import { TokenStorage } from "./TokenStorage"
import { UserStorage } from "./UserStorage"
import { OnboardingStorage } from "./OnboardingStorage"

export function createStorageServices(adapter?: IStorageAdapter) {
  const storageAdapter = adapter || new LocalStorageAdapter()
  return {
    tokenStorage: new TokenStorage(storageAdapter),
    userStorage: new UserStorage(storageAdapter),
    onboardingStorage: new OnboardingStorage(storageAdapter),
  }
}
