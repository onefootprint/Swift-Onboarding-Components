import { IcoCode216, IcoFlask16 } from '@onefootprint/icons';
import { Divider, ThemeToggle, createFontStyles, media } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import React, { useRef, useState } from 'react';
import NavigationFooter from 'src/components/navigation-footer';
import NavigationLogo from 'src/components/navigation-logo';
import styled, { css } from 'styled-components';

import SubsectionNav from '../components/subsection-nav';
import { PageNavProps } from '../nav.types';

const PageNav = ({ sections }: PageNavProps) => {
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
      <NavContainer ref={navInnerScrollRef} onScroll={handleNavInnerScroll} id="nav-container">
        {sections.map((section, i) => (
          <React.Fragment key={section.title}>
            <SectionTitle>
              {section.isPreview ? <IcoFlask16 color="tertiary" /> : <IcoCode216 color="tertiary" />}
              {section.title}
            </SectionTitle>
            {section.subsections
              .filter(subsection => subsection.apiArticles.some(article => !article.api.isHidden))
              .map(subsection => (
                <SubsectionNav subsection={subsection} />
              ))}
            {i !== sections.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </NavContainer>
      <NavigationFooter />
    </PageNavContainer>
  );
};

const PageNavContainer = styled.aside`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      display: flex;
      flex-direction: column;
      background: ${theme.backgroundColor.primary};
      border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      height: 100vh;
      width: var(--page-aside-nav-api-reference-width);
      left: 0;
      top: 0;
      position: relative;
      grid-area: nav;
      width: 100%;
      z-index: 1;
    `};
  `}
`;

const SectionTitle = styled.h3`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    color: ${theme.color.primary};
    padding: ${theme.spacing[6]} ${theme.spacing[3]} ${theme.spacing[4]}
      ${theme.spacing[3]};
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `}
`;

const NavContainer = styled.nav`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    overflow: auto;
    flex-grow: 1;
    padding: ${theme.spacing[2]} ${theme.spacing[3]} ${theme.spacing[7]}
      ${theme.spacing[3]};
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
