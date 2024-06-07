import { ThemeToggle, media } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import React from 'react';
import NavigationLogo from 'src/components/navigation-logo/navigation-logo';
import styled, { css } from 'styled-components';

const DesktopHeader = () => {
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <Container>
      <Nav>
        <NavigationLogo />
      </Nav>
      <ThemeToggle onChange={handleToggleTheme} checked={theme === 'dark'} />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      display: flex;
      height: var(--header-height);
      padding: ${theme.spacing[4]} ${theme.spacing[6]};
      width: 100%;
    `}
  `};
`;

const Nav = styled.nav`
  ${({ theme }) => css`
    width: 100%;
    justify-content: space-between;
    align-items: center;
    display: flex;
    gap: ${theme.spacing[8]};
  `};
`;

export default DesktopHeader;
