import { useAutoAnimate } from '@formkit/auto-animate/react';
import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import {
  IcoClose24,
  IcoMenu24,
  ThemedLogoFpCompact,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Box, createFontStyles, media } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import type { PageNavigation } from 'src/types/page';
import { useLockedBody } from 'usehooks-ts';

import PageNav from './components/page-nav';

type MobileNavProps = {
  navigation?: PageNavigation;
};

const MobileNav = ({ navigation }: MobileNavProps) => {
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
          <MainLinks>
            <LogoLink href={FRONTPAGE_BASE_URL} aria-label={t('nav.home')}>
              <ThemedLogoFpCompact color="primary" />
            </LogoLink>
            <Divider />
            <DocumentationLink href="/">
              {t('nav.documentation')}
            </DocumentationLink>
          </MainLinks>
        </NavTriggerContainer>
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

const Divider = styled.div`
  ${({ theme }) => css`
    height: 100%;
    width: 1px;
    background-color: ${theme.borderColor.tertiary};
    height: 20px;
  `}
`;

const DocumentationLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.tertiary};
    text-decoration: none;
  `}
`;

const MainLinks = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[3]};
    position: relative;
    height: 100%;
  `};
`;

const LogoLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default MobileNav;
