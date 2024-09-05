import { DOCS_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowTopRight16, IcoDotsHorizontal24, IcoLogOut16 } from '@onefootprint/icons';
import { Box, Dropdown } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Suspense, lazy, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RiskSignalsGlossary from 'src/components/risk-signals-glossary';

import type { GetAuthRolesOrg } from '@onefootprint/types';
import PgpUploadTool from 'src/components/pgp-upload-tool';
import type { UserSession } from 'src/hooks/use-session';
import styled, { css } from 'styled-components';
import TenantsList from './components/tenants-list';
import UserName from './components/user-name/user-name';

const WhatsNew = lazy(() => import('./components/whats-new'));

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
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push('/logout');
  };

  const handleTenantChange = (tenantId: string) => {
    onAssumeTenant(tenantId);
    setIsOpen(false);
  };

  const handleGlossaryOpen = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsGlossaryOpen(true);
    }, 50);
  };

  const handleGlossaryClose = () => {
    setIsGlossaryOpen(false);
  };

  const handlePgpHelperOpen = () => {
    setIsPgpHelperOpen(true);
  };

  const handlePgpHelperClose = () => {
    setIsPgpHelperOpen(false);
  };

  const handleWhatsNewOpen = () => {
    setIsWhatsNewOpen(true);
  };

  const handleWhatsNewClose = () => {
    setIsWhatsNewOpen(false);
  };

  return (
    <>
      <Dropdown.Root onOpenChange={setIsOpen} open={isOpen}>
        <Dropdown.Trigger aria-label="Account" variant="icon">
          <IcoDotsHorizontal24 testID="nav-dropdown-button" />
        </Dropdown.Trigger>
        {isOpen && (
          <Dropdown.Content sideOffset={8} $maxWidth="260px">
            <UserName name={user.firstName} lastName={user.lastName} email={user.email} />
            <Dropdown.Separator />
            {tenants?.length > 1 ? (
              <Dropdown.Group>
                <TenantsList tenants={tenants} currTenantId={currTenantId} onSelect={handleTenantChange} />
              </Dropdown.Group>
            ) : null}
            <Dropdown.Separator />
            <Dropdown.Group>
              <Dropdown.Item iconRight={StyledIcoArrowTopRight16}>
                <Link href={`${DOCS_BASE_URL}/login?redirectUrl=/`} target="_blank">
                  {t('help-links.documentation')}
                </Link>
              </Dropdown.Item>
              <Dropdown.Item iconRight={StyledIcoArrowTopRight16}>
                <Link href={`${DOCS_BASE_URL}/login?redirectUrl=/api-reference`} target="_blank">
                  {t('help-links.api-reference')}
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <button type="button" onClick={handleGlossaryOpen}>
                  {t('help-links.risk-signals-glossary')}
                </button>
              </Dropdown.Item>
              <Dropdown.Item>
                <button type="button" onClick={handlePgpHelperOpen}>
                  {t('help-links.pgp-helper-tool')}
                </button>
              </Dropdown.Item>
              <Dropdown.Item>
                <button type="button" onClick={handleWhatsNewOpen}>
                  {t('whats-new.title')}
                </button>
              </Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Separator />
            <Dropdown.Group>
              <Dropdown.Item onSelect={handleLogout} iconLeft={IcoLogOut16}>
                {t('log-out')}
              </Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Content>
        )}
      </Dropdown.Root>
      <RiskSignalsGlossary open={isGlossaryOpen} onClose={handleGlossaryClose} />
      <PgpUploadTool open={isPgpHelperOpen} onClose={handlePgpHelperClose} />
      <Suspense fallback={<Box />}>
        <WhatsNew open={isWhatsNewOpen} onClose={handleWhatsNewClose} />
      </Suspense>
    </>
  );
};

const StyledIcoArrowTopRight16 = styled(IcoArrowTopRight16)`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
  `}
`;

export default NavDropdown;
