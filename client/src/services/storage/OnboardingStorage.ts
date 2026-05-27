import { IStorageAdapter } from "./IStorageAdapter"
import { IOnboardingStorage } from "./IOnboardingStorage"

export class OnboardingStorage implements IOnboardingStorage {
  private readonly key = "onboarding_completed"
  private storage: IStorageAdapter

  constructor(storageAdapter: IStorageAdapter) {
    this.storage = storageAdapter
  }

  isCompleted(): boolean {
    return this.storage.getItem(this.key) === "true"
  }

  markCompleted(): void {
    this.storage.setItem(this.key, "true")
  }

  reset(): void {
    this.storage.removeItem(this.key)
  }
}
