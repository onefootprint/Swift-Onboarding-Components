import { createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

import { NavLink } from '../../../../types';

type MobileNavLinkProps = {
  link: NavLink;
  onClick: () => void;
};

const MobileNavLink = ({ link, onClick }: MobileNavLinkProps) => (
  <StyledLink href={link.href} onClick={onClick}>
    {link.text}
  </StyledLink>
);

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('label-1')};
    color: ${theme.color.primary};
    display: block;
    padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
    text-decoration: none;
  `}
`;

export default MobileNavLink;
