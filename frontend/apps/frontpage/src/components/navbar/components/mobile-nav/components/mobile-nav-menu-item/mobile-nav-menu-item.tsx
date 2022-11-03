import { createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

import { NavMenuItem } from '../../../../types';

type MobileNavMenuItemProps = {
  item: NavMenuItem;
  onClick: () => void;
};

const MobileNavMenuItem = ({ item, onClick }: MobileNavMenuItemProps) => (
  <StyledLink href={item.href} onClick={onClick}>
    {item.text}
  </StyledLink>
);

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('body-1')};
    color: ${theme.color.secondary};
    display: block;
    margin-left: ${theme.spacing[8]};
    padding: ${theme.spacing[4]} ${theme.spacing[6]};
    text-decoration: none;
  `}
`;

export default MobileNavMenuItem;
