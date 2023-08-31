import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { media, ThemeToggle } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import React from 'react';
import NavigationFooter from 'src/components/navigation-footer';
import NavigationLink from 'src/components/navigation-link';
import NavigationLogo from 'src/components/navigation-logo';
import NavigationSectionTitle from 'src/components/navigation-section-title';

import { Navigation } from './types';

type PageNavProps = {
  navigation: Navigation;
};

const PageNav = ({ navigation }: PageNavProps) => {
  const { t } = useTranslation('components.navigation-api-reference');
  const { theme, setTheme } = useTheme();
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };
  const router = useRouter();

  return (
    <PageNavContainer>
      <Header>
        <NavigationLogo section="api-reference" />
        <ThemeToggle onChange={handleToggleTheme} checked={theme === 'dark'} />
      </Header>
      <NavContainer>
        <nav>
          {navigation.map(({ title, subsections }) => (
            <div key={title}>
              <NavigationSectionTitle>{title}</NavigationSectionTitle>
              {subsections.map(({ method, entities, slug }) => (
                <NavigationLink
                  isSelected={router.asPath === slug}
                  href={slug}
                  key={slug}
                >
                  {t(`navigation.methods.${method}`)} {entities}
                </NavigationLink>
              ))}
            </div>
          ))}
        </nav>
      </NavContainer>
      <NavigationFooter linkTo="docs" />
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
      left: 0;
      top: 0;
      
      position: fixed;
      width: var(--page-aside-nav-api-reference-width);
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

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--header-height);
    padding: ${theme.spacing[6]};
  `}
`;

export default PageNav;
