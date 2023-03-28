import { Typography } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';
import styled, { css } from 'styled-components';

import { NavMenuItem } from '../../../../types';

type DesktopNavMenuItemProps = {
  item: NavMenuItem;
};

const DesktopNavMenuItem = ({ item }: DesktopNavMenuItemProps) => (
  <StyledLink href={item.href}>
    <item.iconComponent />
    <ItemText>
      <Typography variant="label-3">{item.text}</Typography>
      <Typography variant="body-3" color="tertiary">
        {item.subtext}
      </Typography>
    </ItemText>
  </StyledLink>
);

const ItemText = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    margin-left: ${theme.spacing[4]};
    text-decoration: none;
  `}
`;

const StyledLink = styled(NavigationMenu.Link)`
  ${({ theme }) => css`
    text-decoration: none;
    display: flex;
    align-items: center;
    flex-direction: row;
    padding: ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary}
    text-decoration: none;
    transition: all 0.1s ease-in-out;

    :hover,
    :focus {
      background-color: ${theme.backgroundColor.secondary};
    }

    > svg {
      align-self: flex-start;
    }
  `}
`;

export default DesktopNavMenuItem;
