import type { UserDatum } from '../../types';
import type { NavigationHeaderLeftButtonProps } from '../layout';

export type HeaderProps = {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  overrideLeftButton?: NavigationHeaderLeftButtonProps;
};
export type ObKeyHeader = { 'X-Onboarding-Config-Key': string };
export type DoneArgs = {
  authToken: string;
  phoneNumber?: UserDatum<string>;
  email?: UserDatum<string>;
};
export type EmailAndOrPhone = { email?: string; phoneNumber?: string };

/**
 * Specifies whether to add the new auth method alongside existing auth methods or replace the existing method.
 * Allowed values: replace, add_primary
 * */
export enum UpdateAuthMethodActionKind {
  replace = 'replace',
  addPrimary = 'add_primary',
}
