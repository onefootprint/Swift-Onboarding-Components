import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled';
import { Button, Container } from 'ui';

type NavbarProps = {
  logoAlt: string;
  cta: string;
};

const Navbar = ({ logoAlt, cta }: NavbarProps) => {
  const [hasScroll, setHasScroll] = useState(false);
  const handleScroll = useCallback(() => {
    setHasScroll(!!window.scrollY);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Header floating={hasScroll}>
      <Container
        as="nav"
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          paddingY: 4,
        }}
      >
        <Image
          alt={logoAlt}
          height={24}
          layout="fixed"
          priority
          src="/images/nav-logo.png"
          width={115}
        />
        <Button size="compact">{cta}</Button>
      </Container>
    </Header>
  );
};

const Header = styled.header<{ floating: boolean }>`
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 20;
  transition: background 200ms ease 0s;

  ${({ theme, floating }) =>
    floating &&
    css`
      backdrop-filter: blur(15px) saturate(125%);
      background-color: rgba(255, 255, 255, 0.75);
      border-bottom: ${theme.borderWidth[1]}px solid
        ${theme.borderColor.primary};
    `}
`;

export default Navbar;
