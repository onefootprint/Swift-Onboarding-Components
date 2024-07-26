import { IcoClose16, IcoCode216, IcoFlask16, IcoMenu16 } from '@onefootprint/icons';
import { Divider, Stack, Text, ThemeToggle, Tooltip, createFontStyles, media } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import React, { forwardRef, useRef, useState } from 'react';
import NavigationFooter from 'src/components/navigation-footer';
import NavigationLogo from 'src/components/navigation-logo';
import NavigationSectionTitle from 'src/components/navigation-section-title';
import styled, { css } from 'styled-components';

import { useRouter } from 'next/router';
import TypeBadge from '../../type-badge';
import NavigationScrollLink from '../components/navigation-scroll-link';
import { PageNavProps } from '../nav.types';
import groupBySection from '../utils/group-by-section';

const CHARACTER_LIMIT_FOR_TOOLTIP = 35;

const PageNav = ({ sections }: PageNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navInnerScrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

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

  const analyzeLength = (path: string) => {
    if (path.length > CHARACTER_LIMIT_FOR_TOOLTIP) {
      return false;
    }
    return true;
  };

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = (path: string) => {
    handleToggleMenu();
    const sectionId = path.split('#')[1];
    router.push(`/api-reference#${sectionId}`);
  };

  return (
    <PageNavContainer $isOpen={isOpen}>
      <Header isScrolled={isScrolled}>
        <Stack direction="row" align="center" justify="center" gap={5}>
          <MenuIconContainer onClick={handleToggleMenu}>{isOpen ? <IcoClose16 /> : <IcoMenu16 />}</MenuIconContainer>
          <Text variant="label-2" tag="span" color="quaternary">
            |
          </Text>
          <NavigationLogo />
        </Stack>
        <ThemeToggle onChange={handleToggleTheme} checked={theme === 'dark'} />
      </Header>
      {isOpen && (
        <InnerContainer>
          <NavContainer ref={navInnerScrollRef} onScroll={handleNavInnerScroll} id="nav-container">
            {sections.map((s, i) => (
              <React.Fragment key={s.title}>
                <SectionTitle>
                  {s.isPreview ? <IcoFlask16 color="tertiary" /> : <IcoCode216 color="tertiary" />}
                  {s.title}
                </SectionTitle>
                {groupBySection(s.articles).map(({ title, subsections }) => (
                  <Group key={title}>
                    <NavigationSectionTitle>{title}</NavigationSectionTitle>
                    {subsections.map(({ method, path, id }) => (
                      <Tooltip key={id} text={path} alignment="center" position="top" disabled={analyzeLength(path)}>
                        <NavigationScrollLink id={id} onClick={() => handleLinkClick(path)}>
                          <Stack justify="center">
                            <TypeBadge skinny type={method} />
                          </Stack>
                          <PathLabel ref={overflowRef}>{path}</PathLabel>
                        </NavigationScrollLink>
                      </Tooltip>
                    ))}
                  </Group>
                ))}
                {i !== sections.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </NavContainer>
          <NavigationFooter />
        </InnerContainer>
      )}
    </PageNavContainer>
  );
};

const InnerContainer = styled.div`
${({ theme }) => css`
    display: flex;
    flex-direction: column;
    height: calc(100vh - var(--header-height));
    background: ${theme.backgroundColor.primary};
  `}
`;

const MenuIconContainer = styled(Stack)`
  ${({ theme }) => css`
    all: unset;
    cursor: pointer;
    padding-top: ${theme.spacing[2]};
  `}
`;

const PageNavContainer = styled.div<{ $isOpen: boolean }>`
  ${({ theme, $isOpen }) => css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    height: var(--header-height);
    max-height: ${$isOpen ? '100vh' : 'var(--header-height)'};
    background: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    z-index: ${theme.zIndex.sticky};
    transition: max-height 0.3s ease-in-out;

    ${media.greaterThan('md')`
      display: none;
    `};
  `}
`;

const PathLabel = styled.span`
  text-transform: lowercase;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  display: block;
  overflow: hidden;
  max-width: 100%;
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

const NavContainer = styled.div`
  ${({ theme }) => css`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    background: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[2]} ${theme.spacing[3]} ${theme.spacing[7]} ${theme.spacing[3]};
    gap: ${theme.spacing[6]};

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
