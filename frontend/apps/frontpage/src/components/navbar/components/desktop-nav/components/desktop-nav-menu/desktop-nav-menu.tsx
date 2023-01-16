import { IcoChevronDown16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { NavMenu } from '../../../../types';
import DesktopNavMenuItem from '../desktop-nav-menu-item';
import NavigationMenu from '../navigation-menu';

type DesktopNavbarMenuProps = {
  menu: NavMenu;
};

const DesktopNavMenu = ({ menu }: DesktopNavbarMenuProps) => {
  const items = menu.items.map(item => (
    <DesktopNavMenuItem item={item} key={item.text} />
  ));

  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <StyledTrigger>
            <Typography variant="label-3">{menu.text}</Typography>
            <IconContainer>
              <IcoChevronDown16 />
            </IconContainer>
          </StyledTrigger>
          <StyledContent>{items}</StyledContent>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <ViewportPosition>
        <NavigationMenu.Viewport />
      </ViewportPosition>
    </NavigationMenu.Root>
  );
};

const StyledContent = styled(NavigationMenu.Content)`
  width: 384px;
`;

const StyledTrigger = styled(NavigationMenu.Trigger)`
  ${({ theme }) => css`
    display: flex;
    cursor: pointer;
    margin-right: calc(-1 * ${theme.spacing[5]});

    &[data-state='open'] {
      text-decoration: underline;

      svg {
        transform: rotate(180deg);
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

const ViewportPosition = styled.div`
  ${({ theme }) => css`
    position: absolute;
    display: flex;
    justify-content: center;
    width: 100%;
    top: 100%;
    margin-top: ${theme.spacing[2]};
    left: 0;
  `}
`;

export default DesktopNavMenu;
