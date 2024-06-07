import { IcoChevronDown16 } from '@onefootprint/icons';
import { createFontStyles } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';
import styled, { css } from 'styled-components';

import type { NavMenu } from '../../../../types';
import MobileNavMenuItem from '../mobile-nav-menu-item';

const { Item: NavigationMenuItem, Trigger: NavigationMenuTrigger, Content: NavigationMenuContent } = NavigationMenu;

type MobileNavMenuProps = {
  menu: NavMenu;
};

const MobileNavMenu = ({ menu }: MobileNavMenuProps) => (
  <ItemContainer>
    <MenuTrigger>
      {menu.text}
      <IconContainer>
        <IcoChevronDown16 />
      </IconContainer>
    </MenuTrigger>
    <MenuContent>
      {menu.items.map(item => (
        <MobileNavMenuItem key={menu.text} item={item} />
      ))}
    </MenuContent>
  </ItemContainer>
);

const ItemContainer = styled(NavigationMenuItem)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${theme.spacing[7]};
    svg {
      transition: all 0.2s linear;
    }
  `}
`;

const MenuTrigger = styled(NavigationMenuTrigger)`
  ${({ theme }) => css`
    all: unset;
    ${createFontStyles('label-1')};
    color: ${theme.color.primary};
    display: flex;
    box-sizing: border-box;
    width: 100%;
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.2s ease-in;
    padding: ${theme.spacing[4]} ${theme.spacing[6]};

    &[data-state='open'] {
      svg {
        transform: rotate(180deg);
      }
    }
  `}
`;

const MenuContent = styled(NavigationMenuContent)`
  ${({ theme }) => css`
    width: 100%;
    margin-bottom: ${theme.spacing[4]};
  `}
`;

export default MobileNavMenu;
