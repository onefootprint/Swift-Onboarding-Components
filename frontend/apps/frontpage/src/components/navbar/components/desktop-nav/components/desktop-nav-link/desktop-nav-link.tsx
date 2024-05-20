import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

import type { NavLink } from '../../../../types';

type DesktopNavLinkProps = {
  link: NavLink;
};
const DesktopNavLink = ({ link }: DesktopNavLinkProps) => (
  <StyledLink asChild>
    <Link href={link.href}>{link.text}</Link>
  </StyledLink>
);

const StyledLink = styled(NavigationMenu.Link)`
  ${({ theme }) => css`
    position: relative;
    color: ${theme.color.primary};
    text-decoration: none;
    display: flex;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    transition: opacity 0.2s ease-in;
    white-space: nowrap;

    &:hover,
    &:focus {
      opacity: 0.7;
    }
  `}
`;

export default DesktopNavLink;
