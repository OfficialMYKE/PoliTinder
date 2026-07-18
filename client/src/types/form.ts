/**
 * Tipos para formularios de autenticación — ISP (Principio de Segregación de Interfaces)
 */

export interface IFormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}
