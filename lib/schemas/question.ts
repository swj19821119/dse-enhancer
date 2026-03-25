import { z } from 'zod';

export const QuestionTypeEnum = z.enum([
  'vocabulary',
  'grammar',
  'reading',
  'listening',
  'writing',
  'speaking',
]);

export type QuestionType = z.infer<typeof QuestionTypeEnum>;

export const PartEnum = z.enum(['part_a', 'part_b']);

export type Part = z.infer<typeof PartEnum>;

export const QuestionOptionsSchema = z.object({
  A: z.string(),
  B: z.string(),
  C: z.string(),
  D: z.string(),
});

export type QuestionOptions = z.infer<typeof QuestionOptionsSchema>;

export const SimpleQuestionContentSchema = z.object({
  question: z.string(),
  options: QuestionOptionsSchema,
});

export const SubQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: QuestionOptionsSchema,
});

export type SubQuestion = z.infer<typeof SubQuestionSchema>;

export const ComplexQuestionContentSchema = z.object({
  passage: z.string().optional(),
  audio_url: z.string().optional(),
  transcript: z.string().optional(),
  questions: z.array(SubQuestionSchema),
});

export const QuestionContentSchema = z.union([
  SimpleQuestionContentSchema,
  ComplexQuestionContentSchema,
]);

export type QuestionContent = z.infer<typeof QuestionContentSchema>;

export const CreateQuestionSchema = z.object({
  type: QuestionTypeEnum,
  subType: z.string().optional(),
  part: PartEnum.optional(),
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.number().min(0.5).max(5.9),
  content: z.string(),
  options: z.string().optional(),
  answer: z.string(),
  explanation: z.string().optional(),
  source: z.string().optional(),
  year: z.number().int().min(2000).max(2030).optional(),
});

export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;

export const UpdateQuestionSchema = CreateQuestionSchema.partial();

export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;

export const QuestionFiltersSchema = z.object({
  type: QuestionTypeEnum.optional(),
  difficulty_min: z.number().min(0.5).max(5.9).optional(),
  difficulty_max: z.number().min(0.5).max(5.9).optional(),
  topic: z.string().optional(),
  grade: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  is_approved: z.boolean().optional(),
});

export type QuestionFilters = z.infer<typeof QuestionFiltersSchema>;

export const BulkImportSchema = z.object({
  questions: z.array(CreateQuestionSchema).min(1, 'At least one question is required'),
});

export type BulkImportInput = z.infer<typeof BulkImportSchema>;

export const QuestionsByDifficultySchema = z.object({
  target_difficulty: z.number().min(0.5).max(5.9),
  count: z.number().int().min(1).max(50).default(10),
  types: z.array(QuestionTypeEnum).optional(),
});

export type QuestionsByDifficultyInput = z.infer<typeof QuestionsByDifficultySchema>;
