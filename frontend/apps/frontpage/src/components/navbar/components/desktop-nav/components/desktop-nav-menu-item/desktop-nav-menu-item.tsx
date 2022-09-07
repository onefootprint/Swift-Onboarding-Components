import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import { createOverlayBackground, Typography } from 'ui';

import { NavMenuItem } from '../../../../types';
import NavigationMenu from '../navigation-menu';

type DesktopNavMenuItemProps = {
  item: NavMenuItem;
};

const DesktopNavMenuItem = ({ item }: DesktopNavMenuItemProps) => (
  <Item>
    <Link href={item.href} passHref>
      <StyledLink href={item.href}>
        <item.iconComponent />
        <ItemText>
          <Typography variant="label-3">{item.text}</Typography>
          <Typography variant="body-3" color="tertiary">
            {item.subtext}
          </Typography>
        </ItemText>
      </StyledLink>
    </Link>
  </Item>
);

const Item = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]}px ${theme.spacing[4]}px;
    border-radius: ${theme.borderRadius[2]}px;
    :hover,
    :focus {
      ${createOverlayBackground('darken-1', 'primary')};
    }
  `}

  a {
    &:hover {
      text-decoration: none;
    }
  }
`;

const ItemText = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[1]}px;
    display: flex;
    flex-direction: column;
    margin-left: ${theme.spacing[4]}px;
    text-decoration: none;

    > :first-child {
      margin-bottom: ${theme.spacing[1]}px;
    }
  `}
`;

const StyledLink = styled(NavigationMenu.Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
  flex-direction: row;
  > svg {
    align-self: flex-start;
  }
`;

export default DesktopNavMenuItem;
