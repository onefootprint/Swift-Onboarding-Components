import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from 'hooks';
import { IcoClose24, IcoMenu24, LogoFpdocsDefault } from 'icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import type { ProductArticle } from 'src/types/product';
import styled, { css } from 'styled-components';
import { Box, media, Tab } from 'ui';
import { useLockedBody } from 'usehooks-ts';

import type { NavItem } from '../../app-header.types';
import ProductNavigation from './components/product-navigation';

type MobileNavProps = {
  navItems: NavItem[];
  articles?: ProductArticle[];
};

const MobileNav = ({ navItems, articles }: MobileNavProps) => {
  const router = useRouter();
  const { t } = useTranslation('components.header');
  const [isExpanded, setIsExpanded] = useState(false);
  const [animateNavMenu] = useAutoAnimate<HTMLDivElement>();
  useLockedBody(isExpanded);

  const handleToggleNav = () => {
    setIsExpanded(prevState => !prevState);
  };

  return (
    <Container>
      <Header>
        <Link href="/">
          <a href="/" aria-label={t('nav.home')}>
            <LogoFpdocsDefault />
          </a>
        </Link>
        {articles && (
          <NavTriggerButton
            type="button"
            onClick={handleToggleNav}
            aria-label={
              isExpanded ? t('nav.nav-toggle.close') : t('nav.nav-toggle.open')
            }
            aria-expanded={isExpanded}
          >
            {isExpanded ? <IcoClose24 /> : <IcoMenu24 />}
          </NavTriggerButton>
        )}
      </Header>
      <Nav>
        <Tab.List>
          {navItems.map(({ href, Icon, text }) => (
            <Link href={href} key={text}>
              <Tab.Item
                href={href}
                iconComponent={Icon}
                selected={router.asPath.startsWith(href)}
              >
                {text}
              </Tab.Item>
            </Link>
          ))}
        </Tab.List>
      </Nav>
      <Box ref={animateNavMenu}>
        {isExpanded && articles && (
          <NavMenu>
            <ProductNavigation articles={articles} />
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

const Header = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[8]}px;
    justify-content: space-between;
    height: 48px;
    padding: 0 ${theme.spacing[5]}px;

    > a {
      display: flex;
    }
  `};
`;

const NavTriggerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  height: 36px;
  margin: 0;
  padding: 0;
  width: 36px;
`;

const Nav = styled.nav`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-top: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    border-bottom: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    display: flex;
    gap: ${theme.spacing[3]}px;
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
  `};
`;

const NavMenu = styled.div`
  ${({ theme }) => css`
    --mobile-header-height: 46px;
    --mobile-nav-height: 48px;

    background: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[7]}px ${theme.spacing[5]}px;
    height: calc(
      100vh - var(--mobile-header-height) - var(--mobile-nav-height)
    );
  `};
`;

export default MobileNav;
