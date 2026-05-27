export interface OnboardingFormValues {
  nickname: string
  avatar: string | null
  dateOfBirth: string
  faculty: string
  career: string
  semester: string | null
  lookingFor: string[]
  bio: string
  studyStyles: string[]
  interests: string[]
}

export interface StepConfig {
  index: number
  title: string
  subtitle: string
  requiredFields: (keyof OnboardingFormValues)[]
  hasOptional: boolean
}

export interface OnboardingSubmitData {
  nickname: string
  avatar: string | null
  dateOfBirth: string
  faculty: string
  career: string
  semester: string | null
  lookingFor: string[]
  bio: string
  studyStyles: string[]
  interests: string[]
}

export type ServerAlertType = "error" | "success" | "info"

export interface ServerAlert {
  type: ServerAlertType
  title: string
  message: string
}
