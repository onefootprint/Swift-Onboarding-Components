import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IcoChevronDown16 } from 'icons';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Box, createFontStyles } from 'ui';

import { NavBarMenu } from '../../../../types';
import MobileNavbarMenuItem from '../mobile-navbar-menu-item';

type MobileNavBarMenuProps = {
  menu: NavBarMenu;
  onClickItem: () => void;
};

const MobileNavBarMenu = ({ menu, onClickItem }: MobileNavBarMenuProps) => {
  const [expanded, setExpanded] = useState(false);
  const [animateMenuItems] = useAutoAnimate<HTMLDivElement>();
  const handleClick = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <MenuTitle onClick={handleClick}>
        {menu.text}
        <IconContainer className={expanded ? 'expanded' : undefined}>
          <IcoChevronDown16 />
        </IconContainer>
      </MenuTitle>
      <Box ref={animateMenuItems}>
        {expanded &&
          menu.items.map(item => (
            <MobileNavbarMenuItem
              key={menu.text}
              item={item}
              onClick={onClickItem}
            />
          ))}
      </Box>
    </>
  );
};

const IconContainer = styled.div`
  svg {
    transition: all 0.2s linear;
  }

  &.expanded {
    svg {
      transform: rotate(180deg);
    }
  }
`;

const MenuTitle = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-1')};
    color: ${theme.color.primary};
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
    text-decoration: none;
  `}
`;

export default MobileNavBarMenu;
