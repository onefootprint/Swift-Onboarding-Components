import { createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

type FooterLinkProps = {
  text: string;
  href: string;
  newWindow?: boolean;
};

const FooterLink = ({ text, href, newWindow }: FooterLinkProps) => (
  <StyledLink href={href} rel="noopener noreferrer" target={newWindow ? '_blank' : undefined}>
    {text}
  </StyledLink>
);

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    text-decoration: none;
    color: ${theme.color.tertiary};

    &:hover {
      color: ${theme.color.secondary};
    }
  `}
`;

export default FooterLink;
