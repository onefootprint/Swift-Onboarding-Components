import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import { createOverlayBackground, Typography } from 'ui';

import { NavBarMenuItem } from '../../../../types';

type DesktopNavBarMenuItemProps = {
  item: NavBarMenuItem;
};

const DesktopNavbarMenuItem = ({ item }: DesktopNavBarMenuItemProps) => (
  <Item>
    <Link href={item.href}>
      <ItemContainer href={item.href}>
        {item.icon}
        <ItemText>
          <Typography variant="label-3">{item.text}</Typography>
          <Typography variant="body-4" color="tertiary">
            {item.subtext}
          </Typography>
        </ItemText>
      </ItemContainer>
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
`;

const ItemText = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    margin-left: ${theme.spacing[2]}px;
  `}
`;

const ItemContainer = styled.a`
  text-decoration: none;
  display: flex;
  align-items: center;
  flex-direction: row;

  > svg {
    align-self: flex-start;
  }
`;

export default DesktopNavbarMenuItem;
