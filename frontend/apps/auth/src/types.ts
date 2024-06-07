import type { FootprintAuthProps, FootprintVariant } from '@onefootprint/footprint-js';

export type Variant = FootprintVariant;
export type FootprintAuthDataProps = Omit<
  FootprintAuthProps,
  'kind' | 'appearance' | 'onCancel' | 'onComplete' | 'onClose'
>;
