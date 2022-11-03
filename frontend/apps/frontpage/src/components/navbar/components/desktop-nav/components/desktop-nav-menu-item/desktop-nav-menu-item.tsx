import { createOverlayBackground, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

import { NavMenuItem } from '../../../../types';

type DesktopNavMenuItemProps = {
  item: NavMenuItem;
};

const DesktopNavMenuItem = ({ item }: DesktopNavMenuItemProps) => (
  <Item>
    <StyledLink href={item.href}>
      <item.iconComponent />
      <ItemText>
        <Typography variant="label-3">{item.text}</Typography>
        <Typography variant="body-3" color="tertiary">
          {item.subtext}
        </Typography>
      </ItemText>
    </StyledLink>
  </Item>
);

const Item = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.default};
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
    margin-top: ${theme.spacing[1]};
    display: flex;
    flex-direction: column;
    margin-left: ${theme.spacing[4]};
    text-decoration: none;

    > :first-child {
      margin-bottom: ${theme.spacing[1]};
    }
  `}
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
  flex-direction: row;
  > svg {
    align-self: flex-start;
  }
`;

export default DesktopNavMenuItem;
