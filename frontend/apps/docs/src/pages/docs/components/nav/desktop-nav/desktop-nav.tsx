import { Box, media } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import NavigationFooter from 'src/components/navigation-footer';
import NavigationLink from 'src/components/navigation-link';
import NavigationSectionTitle from 'src/components/navigation-section-title';
import type { PageNavigation } from 'src/types/page';
import styled, { css } from 'styled-components';

type DesktopNavProps = {
  navigation: PageNavigation;
};

const DesktopNav = ({ navigation }: DesktopNavProps) => {
  const router = useRouter();

  return (
    <DesktopNavContainer>
      <NavContainer>
        {navigation.map(({ name, items }) => (
          <Box key={name}>
            <NavigationSectionTitle>{name}</NavigationSectionTitle>
            <nav>
              {items.map(({ title, slug }) => (
                <NavigationLink
                  key={slug}
                  href={slug}
                  $isSelected={router.asPath === slug}
                >
                  {title}
                </NavigationLink>
              ))}
            </nav>
          </Box>
        ))}
      </NavContainer>
      <NavigationFooter linkTo="api-reference" />
    </DesktopNavContainer>
  );
};

const DesktopNavContainer = styled.aside`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: ${theme.backgroundColor.primary};
      border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      height: calc(100vh - var(--header-height));
      left: 0;
      position: fixed;
      top: var(--header-height);
      width: var(--page-aside-nav-width);
    `};
  `}
`;

const NavContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    overflow: auto;
    padding: ${theme.spacing[7]} ${theme.spacing[3]};
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  `}
`;

export default DesktopNav;
