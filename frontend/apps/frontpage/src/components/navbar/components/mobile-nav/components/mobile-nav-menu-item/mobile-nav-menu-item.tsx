import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import type { NavMenuItem } from '../../../../types';

type MobileNavMenuItemProps = {
  item: NavMenuItem;
};

const MobileNavMenuItem = ({ item }: MobileNavMenuItemProps) => (
  <StyledLink href={item.href}>{item.text}</StyledLink>
);

const StyledLink = styled(NavigationMenu.Link)`
  ${({ theme }) => css`
    ${createFontStyles('body-1')};
    color: ${theme.color.secondary};
    display: flex;
    padding: ${theme.spacing[4]} ${theme.spacing[8]};
    text-decoration: none;
    width: 100%;
  `}
`;

export default MobileNavMenuItem;
