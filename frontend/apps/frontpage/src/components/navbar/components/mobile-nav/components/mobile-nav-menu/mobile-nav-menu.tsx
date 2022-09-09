import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IcoChevronDown16 } from 'icons';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Box, createFontStyles } from 'ui';

import { NavMenu } from '../../../../types';
import MobileNavMenuItem from '../mobile-nav-menu-item';

type MobileNavMenuProps = {
  menu: NavMenu;
  onClickItem: () => void;
};

const MobileNavMenu = ({ menu, onClickItem }: MobileNavMenuProps) => {
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
            <MobileNavMenuItem
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
    cursor: pointer;
  `}
`;

export default MobileNavMenu;
