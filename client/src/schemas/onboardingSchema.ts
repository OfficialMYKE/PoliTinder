import * as z from "zod"

export const identitySchema = z.object({
  nickname: z
    .string()
    .min(2, "Mínimo 2 caracteres.")
    .max(30, "Máximo 30 caracteres."),
  avatar: z.string().nullable().optional(),
  dateOfBirth: z.string().optional(),
})

export const academicSchema = z.object({
  faculty: z.string().min(1, "Selecciona tu facultad."),
  career: z.string().min(1, "Selecciona tu carrera."),
  semester: z.string().nullable().optional(),
  lookingFor: z.array(z.string()).optional(),
})

export const vibeSchema = z.object({
  bio: z
    .string()
    .max(280, "Máximo 280 caracteres.")
    .optional()
    .or(z.literal("")),
  studyStyles: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
})

export const onboardingSchema = z.object({
  nickname: identitySchema.shape.nickname,
  avatar: identitySchema.shape.avatar,
  dateOfBirth: identitySchema.shape.dateOfBirth,
  faculty: academicSchema.shape.faculty,
  career: academicSchema.shape.career,
  semester: academicSchema.shape.semester,
  lookingFor: academicSchema.shape.lookingFor,
  bio: vibeSchema.shape.bio,
  studyStyles: vibeSchema.shape.studyStyles,
  interests: vibeSchema.shape.interests,
})

export type IdentityFormValues = z.infer<typeof identitySchema>
export type AcademicFormValues = z.infer<typeof academicSchema>
export type VibeFormValues = z.infer<typeof vibeSchema>
export type OnboardingFormValues = z.infer<typeof onboardingSchema>
