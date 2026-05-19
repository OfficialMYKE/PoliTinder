/**
 * Interfaz de almacenamiento de usuario - ISP (Principio de Segregación de Interfaces)
 * Interfaz segregada solo para operaciones de usuario
 */

export interface IUserStorage {
  setUser(user: unknown): void;
  getUser(): unknown | null;
  removeUser(): void;
}
