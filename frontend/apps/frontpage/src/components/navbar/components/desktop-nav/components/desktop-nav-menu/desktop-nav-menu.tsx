import { IcoChevronDown16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';
import styled, { css } from 'styled-components';

import { NavMenu } from '../../../../types';
import DesktopNavMenuItem from '../desktop-nav-menu-item';

type DesktopNavbarMenuProps = {
  menu: NavMenu;
};

const DesktopNavMenu = ({ menu }: DesktopNavbarMenuProps) => {
  const items = menu.items.map(item => (
    <DesktopNavMenuItem item={item} key={item.text} />
  ));

  return (
    <ItemContainer>
      <StyledTrigger>
        <Typography variant="label-3">{menu.text}</Typography>
        <IconContainer>
          <IcoChevronDown16 />
        </IconContainer>
      </StyledTrigger>
      <NavigationMenu.Content>{items}</NavigationMenu.Content>
    </ItemContainer>
  );
};

const ItemContainer = styled(NavigationMenu.Item)`
  position: relative;
  display: flex;
`;

const StyledTrigger = styled(NavigationMenu.Trigger)`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    cursor: pointer;
    transition: opacity 0.2s ease-in;
    padding: ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[3]}
      ${theme.spacing[4]};

    &[data-state='open'] {
      opacity: 0.7;

      svg {
        transform: rotate(180deg);
        opacity: 0.7;
      }
    }
  `}
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    min-width: 16px;
    height: 20px;
    display: flex;
    align-items: center;

    svg {
      transition: all 0.2s linear;
      margin-left: ${theme.spacing[2]};
    }
  `}
`;

export default DesktopNavMenu;
