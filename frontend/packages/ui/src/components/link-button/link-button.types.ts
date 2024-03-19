import type { FontVariant } from '@onefootprint/design-tokens';

export type LinkButtonVariant = Exclude<
  FontVariant,
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'heading-4'
  | 'heading-5'
  | 'heading-6'
  | 'display-1'
  | 'display-2'
  | 'display-3'
  | 'display-4'
>;
