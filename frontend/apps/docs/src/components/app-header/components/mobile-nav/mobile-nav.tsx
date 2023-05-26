import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24, IcoMenu24, LogoFpdocsDefault } from '@onefootprint/icons';
import { Box, LinkButton, media } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import type { PageNavigation } from 'src/types/page';
import styled, { css } from 'styled-components';
import { useLockedBody } from 'usehooks-ts';

import type { LinkItem } from '../../app-header.types';
import PageNav from './components/page-nav';

type MobileNavProps = {
  navigation?: PageNavigation;
  links: LinkItem[];
};

const MobileNav = ({ navigation, links }: MobileNavProps) => {
  const { t } = useTranslation('components.header');
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
        <NavTriggerContainer>
          {navigation && (
            <NavTrigger
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
            </NavTrigger>
          )}
          <Link href="/" aria-label={t('nav.home')}>
            <LogoFpdocsDefault />
          </Link>
        </NavTriggerContainer>
        {links.length &&
          links.map(({ href, text, Icon }) => (
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
      </Header>
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

const NavTriggerContainer = styled.div`
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

const NavTrigger = styled.button`
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

const NavMenu = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[7]} ${theme.spacing[5]} ${theme.spacing[4]};
    height: calc(100vh - var(--header-height));
    overflow: auto;
  `};
`;

export default MobileNav;
