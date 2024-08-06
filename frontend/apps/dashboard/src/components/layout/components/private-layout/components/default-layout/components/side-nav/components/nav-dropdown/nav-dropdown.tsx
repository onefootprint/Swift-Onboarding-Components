import { DOCS_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowUpRight16, IcoDotsHorizontal16 } from '@onefootprint/icons';
import { IcoLogOut24 } from '@onefootprint/icons';
import { Dropdown } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RiskSignalsGlossary from 'src/components/risk-signals-glossary';
import styled, { css } from 'styled-components';

import type { GetAuthRolesOrg } from '@onefootprint/types';
import PgpUploadTool from 'src/components/pgp-upload-tool';
import type { UserSession } from 'src/hooks/use-session';
import TenantsList from './components/tenants-list';
import UserName from './components/user-name/user-name';

export type NavDropdownProps = {
  tenants: GetAuthRolesOrg[];
  currTenantId: string;
  onAssumeTenant: (tenantId: string) => void;
  user: UserSession;
};

const NavDropdown = ({ tenants, currTenantId, onAssumeTenant, user }: NavDropdownProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.private-layout.nav' });
  const [isOpen, setIsOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isPgpHelperOpen, setIsPgpHelperOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push('/logout');
  };

  const handleTenantChange = (tenantId: string) => {
    onAssumeTenant(tenantId);
    setIsOpen(false);
  };

  return (
    <>
      <Dropdown.Root onOpenChange={setIsOpen} open={isOpen}>
        <Dropdown.Trigger aria-label="Account">
          <IcoDotsHorizontal16 testID="nav-dropdown-button" />
        </Dropdown.Trigger>
        {isOpen && (
          <NavDropdownContent sideOffset={8} $noPadding>
            <UserName name={user.firstName} lastName={user.lastName} email={user.email} />
            <Dropdown.Separator />
            {tenants?.length > 1 ? (
              <Dropdown.Group>
                <TenantsList tenants={tenants} currTenantId={currTenantId} onSelect={handleTenantChange} />
              </Dropdown.Group>
            ) : null}
            <Dropdown.Separator />
            <Dropdown.Group>
              <StyledLink as={Link} href={`${DOCS_BASE_URL}/login?redirectUrl=/`} target="_blank">
                {t('help-links.documentation')}
                <IcoArrowUpRight16 color="secondary" />
              </StyledLink>
              <StyledLink as={Link} href={`${DOCS_BASE_URL}/login?redirectUrl=/api-reference`} target="_blank">
                {t('help-links.api-reference')}
                <IcoArrowUpRight16 color="secondary" />
              </StyledLink>
              <StyledLink
                onSelect={() => {
                  setIsGlossaryOpen(true);
                }}
              >
                {t('help-links.risk-signals-glossary')}
              </StyledLink>
              <StyledLink
                onSelect={() => {
                  setIsPgpHelperOpen(true);
                }}
              >
                {t('help-links.pgp-helper-tool')}
              </StyledLink>
            </Dropdown.Group>
            <Dropdown.Separator />
            <Dropdown.Group>
              <Dropdown.Item onSelect={handleLogout}>
                <LogoutIcon />
                {t('log-out')}
              </Dropdown.Item>
            </Dropdown.Group>
          </NavDropdownContent>
        )}
      </Dropdown.Root>
      <RiskSignalsGlossary open={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      <PgpUploadTool open={isPgpHelperOpen} onClose={() => setIsPgpHelperOpen(false)} />
    </>
  );
};

const NavDropdownContent = styled(Dropdown.Content)`
  width: 260px;
  overflow: hidden;
`;

const StyledLink = styled(Dropdown.Item)`
  ${({ theme }) => css`
    text-decoration: none;
    cursor: pointer;

    svg {
      margin-top: ${theme.spacing[1]};
    }
  `}
`;

const LogoutIcon = styled(IcoLogOut24)`
  margin-left: -3px;
`;

export default NavDropdown;
