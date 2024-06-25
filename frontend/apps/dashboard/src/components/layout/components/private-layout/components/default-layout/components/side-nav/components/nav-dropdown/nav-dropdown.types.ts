import type { GetAuthRolesOrg } from '@onefootprint/types';
import type { UserSession } from 'src/hooks/use-session';

export type HelpLink = {
  id: string;
  href?: string;
  onClick?: () => void;
  translationKey: TranslationKeys;
};

export type TranslationKeys =
  | 'help-links.documentation'
  | 'help-links.api-reference'
  | 'help-links.risk-signals-glossary'
  | 'help-links.pgp-helper-tool';

export type NavDropdownProps = {
  tenants: GetAuthRolesOrg[];
  currTenantId: string;
  onAssumeTenant: (tenantId: string) => void;
  user: UserSession;
};
