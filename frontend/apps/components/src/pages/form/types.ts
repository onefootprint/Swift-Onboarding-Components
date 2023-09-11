import type { FootprintFormProps } from '@onefootprint/footprint-js';

export type FootprintFormDataProps = Omit<
  FootprintFormProps,
  'kind' | 'appearance' | 'onCancel' | 'onComplete' | 'onClose'
>;
