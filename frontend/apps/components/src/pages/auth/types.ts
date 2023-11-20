import type {
  FootprintAuthProps,
  FootprintVariant,
} from '@onefootprint/footprint-js';

export type DoneArgs = { authToken: string };
export type Variant = FootprintVariant;
export type ObKeyHeader = { 'X-Onboarding-Config-Key': string };
export type FootprintAuthDataProps = Omit<
  FootprintAuthProps,
  'kind' | 'appearance' | 'onCancel' | 'onComplete' | 'onClose'
>;
