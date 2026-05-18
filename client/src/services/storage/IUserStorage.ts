/**
 * User Storage Interface - ISP (Interface Segregation Principle)
 * Segregated interface for user operations only
 */

export interface IUserStorage {
  setUser(user: unknown): void;
  getUser(): unknown | null;
  removeUser(): void;
}
