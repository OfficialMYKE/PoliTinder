/**
 * Formularios - ISP (Interface Segregation)
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

export interface IFormConfig {
  fields: IFormFieldProps[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

export interface IAuthFormProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
}
