import { DOCS_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowTopRight16, IcoDotsHorizontal24, IcoLogOut16 } from '@onefootprint/icons';
import { Box, Dropdown, IconButton } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { GetAuthRolesOrg } from '@onefootprint/types';
import useHasShown2024Wrapped from 'src/hooks/use-has-shown-2024-wrapped';
import type { UserSession } from 'src/hooks/use-session';
import styled, { css } from 'styled-components';
import type { PostDetails } from '../../side-nav.types';
import WhatsNewDialog from '../whats-new-dialog';
import PgpUploadTool from './components/pgp-upload-tool';
import RiskSignalsGlossary from './components/risk-signals-glossary';
import TenantsList from './components/tenants-list';
import UserName from './components/user-name/user-name';
import WrappedDialog from './components/wrapped-dialog';

export type NavDropdownProps = {
  tenants: GetAuthRolesOrg[];
  currTenantId: string;
  onAssumeTenant: (tenantId: string) => void;
  posts: PostDetails[];
  user: UserSession;
};

const NavDropdown = ({ tenants, currTenantId, onAssumeTenant, user, posts }: NavDropdownProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.private-layout.nav' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isPgpHelperOpen, setIsPgpHelperOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const router = useRouter();
  const { hasShown2024Wrapped, markAsShown2024Wrapped } = useHasShown2024Wrapped();
  const [isWrappedOpen, setIsWrappedOpen] = useState(!hasShown2024Wrapped || router.query.show_wrapped === 'true');

  const handleLogout = () => {
    router.push('/logout');
  };

  const handleTenantChange = (tenantId: string) => {
    onAssumeTenant(tenantId);
    setIsDropdownOpen(false);
  };

  const handleGlossaryOpen = () => {
    setIsDropdownOpen(false);
    setIsGlossaryOpen(true);
  };

  const handleGlossaryClose = () => {
    setIsGlossaryOpen(false);
  };

  const handlePgpHelperOpen = () => {
    setIsDropdownOpen(false);
    setIsPgpHelperOpen(true);
  };

  const handlePgpHelperClose = () => {
    setIsDropdownOpen(false);
    setIsPgpHelperOpen(false);
  };

  const handleWhatsNewOpen = () => {
    setIsDropdownOpen(false);
    setIsWhatsNewOpen(true);
  };

  const handleWhatsNewClose = () => {
    setIsDropdownOpen(false);
    setIsWhatsNewOpen(false);
  };

  const handle2024WrappedOpen = () => {
    setIsDropdownOpen(false);
    setIsWrappedOpen(true);
    markAsShown2024Wrapped();
  };

  const handle2024WrappedClose = () => {
    setIsDropdownOpen(false);
    setIsWrappedOpen(false);
  };

  return (
    <>
      <Dropdown.Root onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
        <Dropdown.Trigger asChild>
          <Box>
            <IconButton aria-label="Account" size="compact">
              <IcoDotsHorizontal24 testID="nav-dropdown-button" />
            </IconButton>
          </Box>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content sideOffset={8} maxWidth="260px" align="start">
            <UserName name={user.firstName} lastName={user.lastName} email={user.email} />
            <Dropdown.Divider />
            {tenants?.length > 1 ? (
              <TenantsList tenants={tenants} currTenantId={currTenantId} onSelect={handleTenantChange} />
            ) : null}
            <Dropdown.Divider />
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
              <Dropdown.Item>
                <button type="button" onClick={handle2024WrappedOpen}>
                  {t('2024-wrapped.title')}
                </button>
              </Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Divider />
            <Dropdown.Group>
              <Dropdown.Item onSelect={handleLogout} iconLeft={IcoLogOut16}>
                {t('log-out')}
              </Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      <RiskSignalsGlossary open={isGlossaryOpen} onClose={handleGlossaryClose} />
      <PgpUploadTool open={isPgpHelperOpen} onClose={handlePgpHelperClose} />
      <WhatsNewDialog open={isWhatsNewOpen} onClose={handleWhatsNewClose} posts={posts} />
      <WrappedDialog isOpen={isWrappedOpen} onClose={handle2024WrappedClose} />
    </>
  );
};

const StyledIcoArrowTopRight16 = styled(IcoArrowTopRight16)`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
  `}
`;

export default NavDropdown;
