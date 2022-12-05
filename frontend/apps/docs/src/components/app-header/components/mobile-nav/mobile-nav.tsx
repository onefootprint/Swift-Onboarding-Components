import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24, IcoMenu24, LogoFpdocsDefault } from '@onefootprint/icons';
import { Box, LinkButton, media, Tab, Tabs } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import type { PageNavigation } from 'src/types/page';
import styled, { css } from 'styled-components';
import { useLockedBody } from 'usehooks-ts';

import type { LinkItem, NavItem } from '../../app-header.types';
import PageNav from './components/page-nav';

type MobileNavProps = {
  navItems: NavItem[];
  navigation?: PageNavigation;
  links: LinkItem[];
};

const MobileNav = ({ navItems, navigation, links }: MobileNavProps) => {
  const { t } = useTranslation('components.header');
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [animateNavMenu] = useAutoAnimate<HTMLDivElement>();
  useLockedBody(isExpanded);

  const handleToggleNav = () => {
    setIsExpanded(prevState => !prevState);
  };

  const handleNavItemClick = () => {
    setIsExpanded(false);
  };

  return (
    <Container>
      <Header>
        <InternalNavContainer>
          {navigation && (
            <NavTriggerButton
              type="button"
              onClick={handleToggleNav}
              aria-label={
                isExpanded
                  ? t('nav.nav-toggle.close')
                  : t('nav.nav-toggle.open')
              }
              aria-expanded={isExpanded}
            >
              {isExpanded ? <IcoClose24 /> : <IcoMenu24 />}
            </NavTriggerButton>
          )}
          <Link href="/" aria-label={t('nav.home')}>
            <LogoFpdocsDefault />
          </Link>
        </InternalNavContainer>
        {links.length && (
          <div>
            {links.map(({ href, text, Icon }) => (
              <LinkButton
                href={href}
                iconComponent={Icon}
                key={text}
                size="compact"
                target="_blank"
              >
                {text}
              </LinkButton>
            ))}
          </div>
        )}
      </Header>
      <Nav>
        <Tabs variant="pill">
          {navItems.map(({ baseHref, href, Icon, text }) => (
            <Tab
              as={Link}
              href={href}
              key={text}
              selected={router.asPath.startsWith(baseHref)}
            >
              <Icon />
              {text}
            </Tab>
          ))}
        </Tabs>
      </Nav>
      <Box ref={animateNavMenu}>
        {isExpanded && navigation && (
          <NavMenu>
            <PageNav
              navigation={navigation}
              onNavItemClick={handleNavItemClick}
            />
          </NavMenu>
        )}
      </Box>
    </Container>
  );
};

const Container = styled.div`
  ${media.greaterThan('sm')`
    display: none;
  `}
`;

const InternalNavContainer = styled.div`
  align-items: center;
  display: flex;

  > a {
    display: flex;
  }
`;

const Header = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[5]};
  `};
`;

const NavTriggerButton = styled.button`
  ${({ theme }) => css`
    background: none;
    border: none;
    cursor: pointer;
    height: 24px;
    margin: 0;
    padding: 0;
    width: 24px;
    margin-right: ${theme.spacing[4]};
  `};
`;

const Nav = styled.nav`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `};
`;

const NavMenu = styled.div`
  ${({ theme }) => css`
    --mobile-header-height: 46px;
    --mobile-nav-height: 48px;

    background: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[7]} ${theme.spacing[5]} ${theme.spacing[4]};
    height: calc(
      100vh - var(--mobile-header-height) - var(--mobile-nav-height)
    );
  `};
`;

export default MobileNav;
