import type { UIState } from '@onefootprint/design-tokens';

export const EMPTY_VALUE = '-';

export const statusVariant: Record<string, UIState> = {
  unknown: 'neutral',
  active: 'success',
  inactive: 'error',
};
