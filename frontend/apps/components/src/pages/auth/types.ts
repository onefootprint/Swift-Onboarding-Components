import type { FootprintAuthProps } from '@onefootprint/footprint-js';

export type FootprintAuthDataProps = Omit<
  FootprintAuthProps,
  'kind' | 'appearance' | 'onCancel' | 'onComplete' | 'onClose'
>;
