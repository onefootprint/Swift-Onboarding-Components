import { IcoCode216, IcoFlask16 } from '@onefootprint/icons';
import { Divider, Stack, Text, ThemeToggle, createFontStyles, media } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import React, { useRef, useState } from 'react';
import NavigationFooter from 'src/components/navigation-footer';
import NavigationLogo from 'src/components/navigation-logo';
import NavigationSectionTitle from 'src/components/navigation-section-title';
import styled, { css } from 'styled-components';

import TypeBadge from '../../type-badge';
import NavigationScrollLink from '../components/navigation-scroll-link';
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

  const overflowRef = useRef<HTMLSpanElement>(null);

  return (
    <PageNavContainer>
      <Header isScrolled={isScrolled}>
        <NavigationLogo />
        <ThemeToggle onChange={handleToggleTheme} checked={theme === 'dark'} />
      </Header>
      <NavContainer ref={navInnerScrollRef} onScroll={handleNavInnerScroll} id="nav-container">
        {sections.map((s, i) => (
          <React.Fragment key={s.title}>
            <SectionTitle>
              {s.isPreview ? <IcoFlask16 color="tertiary" /> : <IcoCode216 color="tertiary" />}
              {s.title}
            </SectionTitle>
            {s.subsections
              .filter(s => s.apiArticles.some(a => !a.isHidden))
              .map(({ title, id, apiArticles }) => (
                <Group key={title}>
                  {id ? (
                    <NavigationScrollLink id={id}>
                      <Text variant="body-3">{title}</Text>
                    </NavigationScrollLink>
                  ) : (
                    <NavigationSectionTitle>{title}</NavigationSectionTitle>
                  )}
                  {apiArticles
                    .filter(a => !a.isHidden)
                    .map(({ method, path, id }) => (
                      <NavigationScrollLink id={id}>
                        <Stack justify="center">
                          <TypeBadge skinny type={method} />
                        </Stack>
                        <PathLabel ref={overflowRef}>{path}</PathLabel>
                      </NavigationScrollLink>
                    ))}
                </Group>
              ))}
            {i !== sections.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </NavContainer>
      <NavigationFooter />
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
  max-width: 100%;
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
      width: 100%;
      z-index: 1;
    `};
  `}
`;

const Group = styled.div`
  & > span {
    width: 100%;
  }
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
