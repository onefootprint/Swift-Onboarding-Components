import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import { Box, Button, createFontStyles, media } from 'ui';

import LogoLink from '../logo-link';

type DesktopNavProps = {
  cta: {
    text: string;
    onClick: () => void;
  };
  links: { text: string; href: string }[];
};

const DesktopNav = ({ cta, links }: DesktopNavProps) => (
  <Container>
    <LogoLink />
    <LinksContainer>
      {links.map(link => (
        <Link href={link.href} key={link.text}>
          <a href={link.href}>{link.text}</a>
        </Link>
      ))}
    </LinksContainer>
    <Box>
      <Button onClick={cta.onClick} fullWidth>
        {cta.text}
      </Button>
    </Box>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('lg')`
      align-items: center;
      display: flex;
      flex-grow: 1;
      gap: ${theme.spacing[7]}px;
      justify-content: space-between;
    `}
  `}
`;

const LinksContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[7]}px;

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
