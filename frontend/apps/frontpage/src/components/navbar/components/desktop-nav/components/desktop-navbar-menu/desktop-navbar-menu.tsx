import { IcoChevronDown16 } from 'icons';
import React from 'react';
import styled from 'styled-components';
import { HoverCard, Typography } from 'ui';

import { NavBarMenu } from '../../../../types';
import DesktopNavbarMenuItem from '../desktop-navbar-menu-item';

type DesktopNavbarMenuProps = {
  menu: NavBarMenu;
};

const DesktopNavbarMenu = ({ menu }: DesktopNavbarMenuProps) => {
  const items = menu.items.map(item => (
    <DesktopNavbarMenuItem item={item} key={item.text} />
  ));
  return (
    <HoverCard.Root>
      <StyledHoverCardTrigger aria-label={menu.text}>
        <Typography variant="label-3">{menu.text}</Typography>
        <IconContainer>
          <IcoChevronDown16 />
        </IconContainer>
      </StyledHoverCardTrigger>
      <HoverCard.Portal>
        <HoverCard.Content align="end">{items}</HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};

const StyledHoverCardTrigger = styled(HoverCard.Trigger)`
  display: flex;
  &[data-state='open'] {
    text-decoration: underline;

    svg {
      transform: rotate(180deg);
    }
  }
`;

const IconContainer = styled.div`
  min-width: 16px;
  height: 100%;
  display: flex;
  align-items: center;

  svg {
    transition: all 0.2s linear;
  }
`;

export default DesktopNavbarMenu;
