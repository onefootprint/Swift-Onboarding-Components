import type { Organization } from '@onefootprint/types';

export enum SupportLinkType {
  Email = 'email',
  Phone = 'phone',
  Web = 'website',
}

export type DeleteKeyProps = 'clear_support_phone' | 'clear_support_email' | 'clear_support_website';

export type ContentProps = {
  organization: Organization;
};
