import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import { createFontStyles } from 'ui';

import { NavBarMenuItem } from '../../../../types';

type MobileNavBarMenuItemProps = {
  item: NavBarMenuItem;
  onClick: () => void;
};

const MobileNavBarMenuItem = ({ item, onClick }: MobileNavBarMenuItemProps) => (
  <Link href={item.href}>
    <StyledLink href={item.href} onClick={onClick}>
      {item.text}
    </StyledLink>
  </Link>
);

const StyledLink = styled.a`
  ${({ theme }) => css`
    ${createFontStyles('body-1')};
    color: ${theme.color.secondary};
    display: block;
    margin-left: ${theme.spacing[8]}px;
    padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
    text-decoration: none;
  `}
`;

export default MobileNavBarMenuItem;
