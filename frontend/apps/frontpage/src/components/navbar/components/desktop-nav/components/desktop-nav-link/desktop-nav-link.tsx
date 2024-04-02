import { primitives } from '@onefootprint/design-tokens';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

import type { NavLink } from '../../../../types';

type DesktopNavLinkProps = {
  link: NavLink;
  $isOnDarkSection?: boolean;
};
const DesktopNavLink = ({ link, $isOnDarkSection }: DesktopNavLinkProps) => (
  <NavigationMenu.Item asChild>
    <StyledLink asChild $isOnDarkSection={$isOnDarkSection}>
      <Link href={link.href}>{link.text}</Link>
    </StyledLink>
  </NavigationMenu.Item>
);

const StyledLink = styled(NavigationMenu.Link)<{ $isOnDarkSection?: boolean }>`
  ${({ theme, $isOnDarkSection }) => css`
    position: relative;
    color: ${$isOnDarkSection ? primitives.Gray0 : theme.color.primary};
    text-decoration: none;
    display: flex;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    transition: opacity 0.2s ease-in;
    white-space: nowrap;

    @media (hover: hover) {
      :hover {
        opacity: 0.7;
      }
    }
    :focus {
      opacity: 0.7;
  `}
`;

export default DesktopNavLink;
