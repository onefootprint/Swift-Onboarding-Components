import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

type AProps = {
  children: string;
  href: string;
};

const a = ({ children, href }: AProps) => (
  <Link href={href}>
    <Anchor href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </Anchor>
  </Link>
);

const Anchor = styled.a`
  ${({ theme }) => css`
    color: ${theme.color.accent};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  `};
`;

export default a;
