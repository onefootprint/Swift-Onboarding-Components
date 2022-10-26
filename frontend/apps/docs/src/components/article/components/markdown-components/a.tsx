import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

type AProps = {
  children: string;
  href: string;
};

const a = ({ children, href }: AProps) => (
  <StyledLink href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </StyledLink>
);

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    color: ${theme.color.accent};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  `};
`;

export default a;
