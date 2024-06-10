import { DOCS_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowUpRight16, IcoDotsHorizontal16 } from '@onefootprint/icons';
import { Dropdown, createFontStyles } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RiskSignalsGlossary from 'src/components/risk-signals-glossary';
import styled, { css } from 'styled-components';

import Logout from './components/log-out';
import SectionContainer from './components/section-container';
import TenantsList from './components/tenants-list';
import UserName from './components/user-name/user-name';
import { OPTION_HEIGHT } from './nav-dropdown.constants';
import type { HelpLink, NavDropdownProps } from './nav-dropdown.types';

const helpLinks: HelpLink[] = [
  {
    id: 'documentation',
    href: DOCS_BASE_URL,
    translationKey: 'help-links.documentation',
  },
  {
    id: 'api-documentation',
    href: `${DOCS_BASE_URL}/api-reference`,
    translationKey: 'help-links.api-reference',
  },
  {
    id: 'risk-signals-glossary',
    translationKey: 'help-links.risk-signals-glossary',
  },
];

const NavDropdown = ({ tenants, currTenantId, onAssumeTenant, user }: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const { t } = useTranslation('common', {
    keyPrefix: 'components.private-layout.nav',
  });
  const router = useRouter();

  const handleLogout = () => {
    router.push('/logout');
  };

  const handleTenantChange = (tenantId: string) => {
    onAssumeTenant(tenantId);
    setIsOpen(false);
  };

  const handleLinkSelect = (link: HelpLink) => {
    if (link.href) {
      window.open(link.href, '_blank');
    } else if (link.id === 'risk-signals-glossary') {
      setIsGlossaryOpen(true);
    }
    setIsOpen(false);
  };

  return (
    <>
      <Dropdown.Root onOpenChange={setIsOpen} open={isOpen}>
        <StyledTrigger aria-label="Account">
          <IcoDotsHorizontal16 testID="nav-dropdown-button" />
        </StyledTrigger>
        {isOpen && (
          <Dropdown.Portal forceMount>
            <NavDropdownContent forceMount sideOffset={8}>
              <UserName name={user.firstName} lastName={user.lastName} email={user.email} />
              {tenants?.length > 1 && (
                <TenantsList tenants={tenants} currTenantId={currTenantId} onSelect={handleTenantChange} />
              )}
              <SectionContainer>
                {helpLinks.map(link => (
                  <StyledLink
                    key={link.id}
                    onSelect={event => {
                      event.preventDefault();
                      handleLinkSelect(link);
                    }}
                  >
                    {t(link.translationKey)}
                    {link.href && <IcoArrowUpRight16 color="secondary" />}
                  </StyledLink>
                ))}
              </SectionContainer>
              <Logout onSelect={handleLogout}>{t('log-out')}</Logout>
            </NavDropdownContent>
          </Dropdown.Portal>
        )}
      </Dropdown.Root>
      <RiskSignalsGlossary open={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </>
  );
};

const StyledTrigger = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${theme.spacing[7]};
    height: ${theme.spacing[7]};
    border-radius: calc(${theme.borderRadius.default} - ${theme.spacing[1]});
  `}
`;

const NavDropdownContent = styled(Dropdown.Content)`
  width: 260px;
  overflow: hidden;
`;

const StyledLink = styled(Dropdown.Item)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    text-decoration: none;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    color: ${theme.color.secondary};
    cursor: pointer;
    height: ${OPTION_HEIGHT};

    &:hover {
      color: ${theme.color.primary};
      background-color: ${theme.backgroundColor.secondary};
    }

    svg {
      margin-top: 2px;
    }
  `}
`;

export default NavDropdown;
