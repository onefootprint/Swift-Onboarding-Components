import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import { createFontStyles } from 'ui';

import { NavBarLink } from '../../../../types';

type MobileNavBarLinkProps = {
  link: NavBarLink;
  onClick: () => void;
};

const MobileNavBarLink = ({ link, onClick }: MobileNavBarLinkProps) => (
  <Link href={link.href}>
    <StyledLink href={link.href} onClick={onClick}>
      {link.text}
    </StyledLink>
  </Link>
);

const StyledLink = styled.a`
  ${({ theme }) => css`
    ${createFontStyles('label-1')};
    color: ${theme.color.primary};
    display: block;
    padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
    text-decoration: none;
  `}
`;

export default MobileNavBarLink;
