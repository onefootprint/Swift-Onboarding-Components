import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  createFontStyles,
  Divider,
  media,
  ThemeToggle,
} from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import React, { useRef, useState } from 'react';
import NavigationFooter from 'src/components/navigation-footer';
import NavigationLogo from 'src/components/navigation-logo';
import NavigationSectionTitle from 'src/components/navigation-section-title';

import NavigationScrollLink from './components/navigation-scroll-link';
import type { Navigation } from './page-nav.types';

type PageNavProps = {
  navigation: Navigation;
  navigationPreviewSection?: Navigation;
};

const PageNav = ({ navigation, navigationPreviewSection }: PageNavProps) => {
  const { t } = useTranslation('components.navigation-api-reference');
  const navInnerScrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };
  const handleNavInnerScroll = () => {
    if (navInnerScrollRef.current) {
      const { scrollTop } = navInnerScrollRef.current;
      setIsScrolled(scrollTop > 0);
    }
  };

  return (
    <PageNavContainer>
      <Header isScrolled={isScrolled}>
        <NavigationLogo />
        <ThemeToggle onChange={handleToggleTheme} checked={theme === 'dark'} />
      </Header>
      <NavContainer
        ref={navInnerScrollRef}
        onScroll={handleNavInnerScroll}
        id="nav-container"
      >
        <nav>
          <SectionTitle>{t('sections.footprint-api')}</SectionTitle>
          {navigation.map(({ title, subsections }) => (
            <div key={title}>
              <NavigationSectionTitle>{title}</NavigationSectionTitle>
              {subsections.map(({ method, entities, id }) => (
                <NavigationScrollLink key={id} id={id}>
                  {t(`navigation.methods.${method}`)} {entities}
                </NavigationScrollLink>
              ))}
            </div>
          ))}
          <Divider />
          <SectionTitle>{t('sections.footprint-api-preview')}</SectionTitle>
          {navigationPreviewSection?.map(({ title, subsections }) => (
            <div key={title}>
              <NavigationSectionTitle>{title}</NavigationSectionTitle>
              {subsections.map(({ method, entities, id }) => (
                <NavigationScrollLink key={id} id={id}>
                  {t(`navigation.methods.${method}`)} {entities}
                </NavigationScrollLink>
              ))}
            </div>
          ))}
        </nav>
      </NavContainer>
      <NavigationFooter linkTo="docs" />
    </PageNavContainer>
  );
};

const SectionTitle = styled.h3`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    color: ${theme.color.primary};
    padding: ${theme.spacing[6]} ${theme.spacing[3]} ${theme.spacing[4]}
      ${theme.spacing[4]};
    text-transform: uppercase;
  `}
`;

const PageNavContainer = styled.aside`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      display: flex;
      flex-direction: column;
      background: ${theme.backgroundColor.primary};
      border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      height: 100vh;
      left: 0;
      top: 0;
      position: relative;
      width: var(--page-aside-nav-api-reference-width);
      grid-area: nav;
    `};
  `}
`;

const NavContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    overflow: auto;
    flex-grow: 1;
    padding: ${theme.spacing[2]} ${theme.spacing[3]} ${theme.spacing[7]}
      ${theme.spacing[3]};

    a {
      text-transform: capitalize;
    }
  `}
`;

const Header = styled.header<{ isScrolled: boolean }>`
  ${({ theme, isScrolled }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--header-height);
    padding: ${theme.spacing[6]};
    border-bottom: ${theme.borderWidth[1]} solid
      ${isScrolled ? theme.borderColor.tertiary : 'transparent'};
  `}
`;

export default PageNav;
