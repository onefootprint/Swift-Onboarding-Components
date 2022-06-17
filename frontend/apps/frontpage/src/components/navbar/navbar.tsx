import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { Button, Container, FootprintLogo } from 'ui';

export type NavbarProps = {
  cta: string;
  logoAlt: string;
  onCtaClick: () => void;
};

const Navbar = ({ logoAlt, cta, onCtaClick }: NavbarProps) => {
  const [hasScroll, setHasScroll] = useState(false);
  const handleScroll = useCallback(() => {
    setHasScroll(window.scrollY > 0);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <Header isFloating={hasScroll}>
      <Container
        as="nav"
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          paddingY: 4,
        }}
      >
        <Link href="/">
          <a href="/" aria-label="Go to Footprint's main page">
            <FootprintLogo alt={logoAlt} height={24} width={115} />
          </a>
        </Link>
        <Button size="compact" onClick={onCtaClick}>
          {cta}
        </Button>
      </Container>
    </Header>
  );
};

const Header = styled.header<{ isFloating: boolean }>`
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  transition: background 200ms ease 0s;
  z-index: 20;

  ${({ theme, isFloating }) =>
    isFloating &&
    css`
      backdrop-filter: blur(15px) saturate(125%);
      background-color: rgba(255, 255, 255, 0.75);
      border-bottom: ${theme.borderWidth[1]}px solid
        ${theme.borderColor.primary};
    `}
`;

export default Navbar;
