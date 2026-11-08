export const SHIFT_TYPES = ['bar', 'bar-support', 'cleaning'] as const;

export type ShiftType = (typeof SHIFT_TYPES)[number];

export const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
  bar: 'Barschicht',
  cleaning: 'Putzen',
  'bar-support': 'Springer*in',
};
