import Image from 'next/image';
import React from 'react';
import { Button, Container } from 'ui';

type NavbarProps = {
  logoAltText: string;
  ctaText: string;
};

const Navbar = ({ logoAltText, ctaText }: NavbarProps) => (
  <Container
    as="nav"
    sx={{
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 10,
      paddingY: 5,
    }}
  >
    <Image
      alt={logoAltText}
      height={24}
      layout="fixed"
      priority
      src="/images/nav-logo.png"
      width={115}
    />
    <Button size="compact">{ctaText}</Button>
  </Container>
);

export default Navbar;
