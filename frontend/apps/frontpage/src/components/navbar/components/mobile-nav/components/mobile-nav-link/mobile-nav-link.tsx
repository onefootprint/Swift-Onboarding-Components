import { createFontStyles } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';
import styled, { css } from 'styled-components';

import type { NavLink } from '../../../../types';

type MobileNavLinkProps = {
  link: NavLink;
};

const { Link: NavigationMenuLink, Item: NavigationMenuItem } = NavigationMenu;

const MobileNavLink = ({ link }: MobileNavLinkProps) => (
  <ItemContainer>
    <StyledLink href={link.href}>{link.text}</StyledLink>
  </ItemContainer>
);

const StyledLink = styled(NavigationMenuLink)`
  ${({ theme }) => css`
    ${createFontStyles('label-1')};
    color: ${theme.color.primary};
    display: block;
    padding: ${theme.spacing[4]} ${theme.spacing[6]};
    text-decoration: none;
    width: 100%;
  `}
`;

const ItemContainer = styled(NavigationMenuItem)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export default MobileNavLink;
