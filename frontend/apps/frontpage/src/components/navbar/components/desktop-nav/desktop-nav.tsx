import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import { Button, createFontStyles, media } from 'ui';

type DesktopNavProps = {
  cta: {
    text: string;
    onClick: () => void;
  };
  links: { text: string; href: string }[];
};

const DesktopNav = ({ cta, links }: DesktopNavProps) => (
  <Container>
    <LinksContainer>
      {links.map(link => (
        <Link href={link.href} key={link.text}>
          <a href={link.href}>{link.text}</a>
        </Link>
      ))}
    </LinksContainer>
    <Button onClick={cta.onClick} fullWidth>
      {cta.text}
    </Button>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('lg')`
      align-items: center;
      display: flex;
      gap: ${theme.spacing[7]}px;
    `}
  `}
`;

const LinksContainer = styled.div`
  ${({ theme }) => css`
    a {
      ${createFontStyles('label-3')};
      color: ${theme.color.primary};
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  `}
`;

export default DesktopNav;
