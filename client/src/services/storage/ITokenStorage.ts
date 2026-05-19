/**
 * Interfaz de almacenamiento de token — ISP (Principio de Segregación de Interfaces)
 * Interfaz segregada exclusivamente para operaciones con tokens JWT
 */

export interface ITokenStorage {
  setToken(token: string): void;
  getToken(): string | null;
  removeToken(): void;
}
