import type {
  FootprintAuthProps,
  FootprintVariant,
} from '@onefootprint/footprint-js';

export type EmailAndOrPhone = { email?: string; phoneNumber?: string };
export type DoneArgs = { authToken: string };
export type Variant = FootprintVariant;
export type ObKeyHeader = { 'X-Onboarding-Config-Key': string };
export type HeaderProps = { title: string; subtitle?: string };
export type FootprintAuthDataProps = Omit<
  FootprintAuthProps,
  'kind' | 'appearance' | 'onCancel' | 'onComplete' | 'onClose'
>;
