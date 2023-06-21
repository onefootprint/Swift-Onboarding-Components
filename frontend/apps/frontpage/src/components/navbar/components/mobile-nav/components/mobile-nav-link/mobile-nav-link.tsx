import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import { NavLink } from '../../../../types';

type MobileNavLinkProps = {
  link: NavLink;
};

const MobileNavLink = ({ link }: MobileNavLinkProps) => (
  <ItemContainer>
    <StyledLink href={link.href}>{link.text}</StyledLink>
  </ItemContainer>
);

const StyledLink = styled(NavigationMenu.Link)`
  ${({ theme }) => css`
    ${createFontStyles('label-1')};
    color: ${theme.color.primary};
    display: block;
    padding: ${theme.spacing[4]} ${theme.spacing[6]};
    text-decoration: none;
    width: 100%;
  `}
`;

const ItemContainer = styled(NavigationMenu.Item)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export default MobileNavLink;
