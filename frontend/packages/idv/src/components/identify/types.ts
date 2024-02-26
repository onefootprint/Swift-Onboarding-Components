import type { NavigationHeaderLeftButtonProps } from '../layout';

export type HeaderProps = {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  overrideLeftButton?: NavigationHeaderLeftButtonProps;
};
export type ObKeyHeader = { 'X-Onboarding-Config-Key': string };
export type DoneArgs = {
  authToken: string;
  /// TODO deprecate this. We pass this in as bootstrap data to the collect KYC data machine, which
  /// doesn't really make sense
  phoneNumber?: string;
  /// TODO deprecate this. We pass this in as bootstrap data to the collect KYC data machine, which
  /// doesn't really make sense
  email?: string;
};
export type EmailAndOrPhone = { email?: string; phoneNumber?: string };
