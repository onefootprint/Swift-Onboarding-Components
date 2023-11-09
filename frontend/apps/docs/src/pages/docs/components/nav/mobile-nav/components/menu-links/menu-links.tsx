import styled, { css } from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import NavigationFooter from 'src/components/navigation-footer';
import NavigationLink from 'src/components/navigation-link';
import NavigationSectionTitle from 'src/components/navigation-section-title';
import type { PageNavigation } from 'src/types/page';

type PageNavProps = {
  navigation: PageNavigation;
  onNavItemClick: () => void;
};

const MenuLinks = ({ navigation, onNavItemClick }: PageNavProps) => {
  const router = useRouter();

  return (
    <MenuLinksContainer>
      <NavContainer>
        {navigation.map(({ name, items }) => (
          <Box key={name}>
            <NavigationSectionTitle>{name}</NavigationSectionTitle>
            <nav>
              {items.map(({ title, slug }) => (
                <NavigationLink
                  isSelected={router.asPath === slug}
                  href={slug}
                  key={slug}
                  onClick={onNavItemClick}
                >
                  {title}
                </NavigationLink>
              ))}
            </nav>
          </Box>
        ))}
      </NavContainer>
      <NavigationFooter linkTo="api-reference" />
    </MenuLinksContainer>
  );
};

const MenuLinksContainer = styled.div`
  ${({ theme }) => css`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    ul {
      padding-top: ${theme.spacing[5]};
    }
  `}
`;

const NavContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[7]}
      ${theme.spacing[3]};
  `}
`;

export default MenuLinks;
