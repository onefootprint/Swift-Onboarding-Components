import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24, IcoMenu24, LogoFpdocsDefault } from 'icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import type { ProductArticle } from 'src/types/product';
import styled, { css } from 'styled-components';
import { Box, LinkButton, media, Tab, Tabs } from 'ui';
import { useLockedBody } from 'usehooks-ts';

import type { NavItem } from '../../app-header.types';
import ProductNavigation from './components/product-navigation';

type MobileNavProps = {
  navItems: NavItem[];
  articles?: ProductArticle[];
  links: NavItem[];
};

const MobileNav = ({ navItems, articles, links }: MobileNavProps) => {
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
        <InternalNavContainer>
          {articles && (
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
          <Link href="/">
            <a href="/" aria-label={t('nav.home')}>
              <LogoFpdocsDefault />
            </a>
          </Link>
        </InternalNavContainer>
        {links.length && (
          <div>
            {links.map(({ href, text, Icon }) => (
              <LinkButton
                href={href}
                iconComponent={Icon}
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
          {navItems.map(({ href, Icon, text }) => (
            <Link href={href} key={text}>
              <Tab href={href} selected={router.asPath.startsWith(href)}>
                <Icon />
                {text}
              </Tab>
            </Link>
          ))}
        </Tabs>
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
    padding: ${theme.spacing[5]}px;
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
    margin-right: ${theme.spacing[4]}px;
  `};
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
