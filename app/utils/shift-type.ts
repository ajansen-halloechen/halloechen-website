import {
  SHIFT_TYPE_LABELS,
  SHIFT_TYPES,
  type ShiftType,
} from '~~/shared/types/shift-type';

export type ShiftTypeBadgeColor = 'primary' | 'accent' | 'warning' | 'neutral';

export const shiftTypeColors: Record<ShiftType, ShiftTypeBadgeColor> = {
  bar: 'neutral',
  'bar-support': 'primary',
  cleaning: 'accent',
};

export { SHIFT_TYPE_LABELS as shiftTypeLabels, SHIFT_TYPES as shiftTypes };
