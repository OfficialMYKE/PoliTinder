/**
 * Token Storage Interface - ISP (Interface Segregation Principle)
 * Segregated interface for token operations only
 */

export interface ITokenStorage {
  setToken(token: string): void;
  getToken(): string | null;
  removeToken(): void;
}
