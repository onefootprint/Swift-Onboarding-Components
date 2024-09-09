import { createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import NavigationLink from 'src/components/navigation-link';
import NavigationSubcategory from 'src/components/navigation-subcategory';
import type { PageNavigation } from 'src/types/page';
import styled, { css } from 'styled-components';

type AppNavProps = {
  navigation: PageNavigation;
  onItemClick?: () => void;
};

const AppNav = ({ navigation, onItemClick }: AppNavProps) => {
  const router = useRouter();

  return navigation.map(({ name, items }) => (
    <React.Fragment key={name}>
      <NavigationSectionTitle>{name}</NavigationSectionTitle>
      <nav>
        {items.map(({ title, slug, items: subItems }) => {
          const hasSubItems = subItems && subItems.length > 0;

          return hasSubItems ? (
            <NavigationSubcategory
              items={subItems}
              key={`nav-subcategory-${title}-${slug}`}
              onItemClick={onItemClick}
              title={title}
            />
          ) : (
            <NavigationLink
              $isSelected={router.asPath === slug}
              as={Link}
              href={slug}
              key={`nav-item-${title}-${slug}`}
              onClick={onItemClick}
            >
              {title}
            </NavigationLink>
          );
        })}
      </nav>
    </React.Fragment>
  ));
};

const NavigationSectionTitle = styled.header`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    text-transform: capitalize;
  `}
`;

export default AppNav;
