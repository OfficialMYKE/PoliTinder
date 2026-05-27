export interface IOnboardingStorage {
  isCompleted(): boolean
  markCompleted(): void
  reset(): void
}
