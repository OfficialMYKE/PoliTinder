/**
 * Interfaz de almacenamiento de token - ISP (Principio de Segregación de Interfaces)
 * Interfaz segregada solo para operaciones de token
 */

export interface ITokenStorage {
  setToken(token: string): void;
  getToken(): string | null;
  removeToken(): void;
}
