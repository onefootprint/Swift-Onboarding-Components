import { primitives } from '@onefootprint/design-tokens';
import { createFontStyles } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

import type { NavMenuItem } from '../../../../types';

type DesktopNavMenuItemProps = {
  item: NavMenuItem;
  $isOnDarkSection?: boolean;
};

const DesktopNavMenuItem = ({
  item,
  $isOnDarkSection,
}: DesktopNavMenuItemProps) => {
  const Icon = item.iconComponent;
  return (
    <StyledLink $isOnDarkSection={$isOnDarkSection} asChild>
      <Link href={item.href}>
        <Icon />
        <ItemText>
          <Title $isOnDarkSection={$isOnDarkSection}>{item.text}</Title>
          <Subtitle $isOnDarkSection={$isOnDarkSection}>
            {item.subtext}
          </Subtitle>
        </ItemText>
      </Link>
    </StyledLink>
  );
};

const ItemText = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    margin-left: ${theme.spacing[4]};
    text-decoration: none;
  `}
`;

const Title = styled.p<{ $isOnDarkSection?: boolean }>`
  ${({ theme, $isOnDarkSection }) => css`
    ${createFontStyles('label-3')}
    color: ${$isOnDarkSection ? primitives.Gray0 : theme.color.primary};
    text-decoration: none;
    display: flex;
  `}
`;

const Subtitle = styled.p<{ $isOnDarkSection?: boolean }>`
  ${({ theme, $isOnDarkSection }) => css`
    ${createFontStyles('body-3')}
    color: ${$isOnDarkSection ? primitives.Gray200 : theme.color.tertiary};
    text-decoration: none;
    display: flex;
  `}
`;

const StyledLink = styled(NavigationMenu.Link)<{ $isOnDarkSection?: boolean }>`
  ${({ theme, $isOnDarkSection }) => css`
    text-decoration: none;
    display: flex;
    align-items: center;
    flex-direction: row;
    padding: ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary}
    text-decoration: none;
    transition: all 0.1s ease-in-out;

    &:hover {
      background-color: ${
        $isOnDarkSection ? primitives.Gray800 : theme.backgroundColor.secondary
      };
    }
    :focus {
      background-color: ${
        $isOnDarkSection ? primitives.Gray800 : theme.backgroundColor.secondary
      };
    }

    > svg {
      align-self: flex-start;
    }

    && {
      svg {
        path {
          fill: ${$isOnDarkSection ? primitives.Gray0 : theme.color.primary};
        }
      }
    }
  `}
`;

export default DesktopNavMenuItem;
