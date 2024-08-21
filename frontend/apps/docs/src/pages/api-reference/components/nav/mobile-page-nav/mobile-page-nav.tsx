import { IcoClose16, IcoMenu16 } from '@onefootprint/icons';
import { Stack, Text, ThemeToggle, media } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import { useRef, useState } from 'react';
import NavigationFooter from 'src/components/navigation-footer';
import NavigationLogo from 'src/components/navigation-logo';
import styled, { css } from 'styled-components';

import SectionNav from '../components/section-nav';
import type { PageNavProps } from '../nav.types';

const PageNav = ({ sections }: PageNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    handleToggleMenu();
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
            {sections.map(section => (
              <SectionNav section={section} onLinkClick={handleLinkClick} />
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

const NavContainer = styled.div`
  ${({ theme }) => css`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    background: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[2]} ${theme.spacing[3]} ${theme.spacing[7]} ${theme.spacing[3]};
    gap: ${theme.spacing[6]};
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
