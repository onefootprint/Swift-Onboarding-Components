import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IcoChevronRight16 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import type { PageNavigationItem } from 'src/types/page';
import styled, { css } from 'styled-components';

import NavigationLink from '../navigation-link';

export type NavigationSubcategoryProps = {
  title: string;
  items: PageNavigationItem[];
};

const NavigationSubcategory = ({
  title,
  items,
}: NavigationSubcategoryProps) => {
  const router = useRouter();
  const [isSelected, setSelected] = useState(() =>
    items.some(item => router.asPath.startsWith(item.slug)),
  );
  const [animatedList] = useAutoAnimate<HTMLElement>();

  const handleTitleClick = () => {
    setSelected(!isSelected);
  };

  return (
    <NavigationSubcategoryContainer>
      <TitleContainer
        aria-selected={isSelected}
        type="button"
        onClick={handleTitleClick}
      >
        <Text variant="label-4">{title}</Text>
        <StyledChevron
          color={isSelected ? 'primary' : 'tertiary'}
          $isSelected={isSelected}
        />
      </TitleContainer>
      <div ref={animatedList}>
        {isSelected && (
          <Nav>
            {items.map(item => (
              <NavigationLink
                $isSelected={router.asPath.startsWith(item.slug)}
                as={Link}
                href={item.slug}
                key={item.slug}
              >
                {item.title}
              </NavigationLink>
            ))}
          </Nav>
        )}
      </div>
    </NavigationSubcategoryContainer>
  );
};

const NavigationSubcategoryContainer = styled.div`
  ${({ theme }) => css`
    cursor: pointer;
    margin-bottom: ${theme.spacing[2]};
  `}
`;

const TitleContainer = styled.button`
  ${({ theme }) => css`
    align-items: center;
    background: none;
    border-radius: ${theme.borderRadius.default};
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    margin: 0;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    width: 100%;

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }

    &[aria-selected='false'] {
      p {
        color: ${theme.color.tertiary};
      }
    }

    &[aria-selected='true'] {
      /* background-color: ${theme.backgroundColor.secondary}; */
      p {
        color: ${theme.color.primary};
      }
    }
  `}
`;

const StyledChevron = styled(IcoChevronRight16)<{ $isSelected: boolean }>`
  transform: rotate(${({ $isSelected }) => ($isSelected ? '90deg' : '0')});
  transition: transform 0.2s;
`;

const Nav = styled.nav`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[4]};
    margin-top: ${theme.spacing[2]};
  `}
`;

export default NavigationSubcategory;
