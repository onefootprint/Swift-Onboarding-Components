import type {
  FootprintAuthProps,
  FootprintVariant,
} from '@onefootprint/footprint-js';

export type Variant = FootprintVariant;
export type HeaderProps = { title: string; subtitle?: string };
export type FootprintAuthDataProps = Omit<
  FootprintAuthProps,
  'kind' | 'appearance' | 'onCancel' | 'onComplete' | 'onClose'
>;
