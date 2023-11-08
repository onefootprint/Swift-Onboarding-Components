import { IcoCode216, IcoFlask16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  createFontStyles,
  Divider,
  media,
  Stack,
  ThemeToggle,
} from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import React, { useRef, useState } from 'react';
import NavigationFooter from 'src/components/navigation-footer';
import NavigationLogo from 'src/components/navigation-logo';
import NavigationSectionTitle from 'src/components/navigation-section-title';

import type { Article } from '../../api-reference.types';
import TypeBadge from '../type-badge';
import NavigationScrollLink from './components/navigation-scroll-link';

type PageNavProps = {
  sections: PageNavSection[];
};

export type PageNavSection = {
  title: string;
  isPreview: boolean;
  articles: Article[];
};

type Section = {
  title: string;
  subsections: Article[];
};

/// A stable operation that groups _adjacent_ articles that have the same section name.
/// This preserves the order of the input articles so they are displayed in navigation in the same
/// order in which they are displayed in the site body
const groupBySection = (articles: Article[]) => {
  const sections: Section[] = [];
  articles.forEach(a => {
    const currentSection = sections.length
      ? sections[sections.length - 1]
      : undefined;
    if (currentSection?.title === a.section) {
      currentSection.subsections.push(a);
    } else {
      sections.push({
        title: a.section,
        subsections: [a],
      });
    }
  });
  return sections;
};

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
      <NavContainer
        ref={navInnerScrollRef}
        onScroll={handleNavInnerScroll}
        id="nav-container"
      >
        <nav>
          {sections.map((s, i) => (
            <React.Fragment key={s.title}>
              <SectionTitle>
                {s.isPreview ? (
                  <IcoFlask16 color="tertiary" />
                ) : (
                  <IcoCode216 color="tertiary" />
                )}
                {s.title}
              </SectionTitle>
              {groupBySection(s.articles).map(({ title, subsections }) => (
                <div key={title}>
                  <NavigationSectionTitle>{title}</NavigationSectionTitle>
                  {subsections.map(({ method, path, id }) => (
                    <NavigationScrollLink key={id} id={id}>
                      <Stack justify="center">
                        <TypeBadge skinny type={method} />
                      </Stack>
                      <PathLabel>{path}</PathLabel>
                    </NavigationScrollLink>
                  ))}
                </div>
              ))}
              {i !== sections.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </nav>
      </NavContainer>
      <NavigationFooter linkTo="docs" />
    </PageNavContainer>
  );
};

const PathLabel = styled.span`
  text-transform: lowercase;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  display: block;
  overflow: hidden;
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
      width: var(--page-aside-nav-api-reference-width);
      left: 0;
      top: 0;
      position: relative;
      grid-area: nav;
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
