import type { z } from 'zod';
import type {
  shiftTemplateCreateSchema,
  shiftTemplatePatchSchema,
  shiftTemplateSchema,
} from '#server/entities/shift-template/shift-template.schema';

export type ShiftTemplate = z.infer<typeof shiftTemplateSchema>;
export type ShiftTemplateCreate = z.infer<typeof shiftTemplateCreateSchema>;
export type ShiftTemplatePatch = z.infer<typeof shiftTemplatePatchSchema>;
