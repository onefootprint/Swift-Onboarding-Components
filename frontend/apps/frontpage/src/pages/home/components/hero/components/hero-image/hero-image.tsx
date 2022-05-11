import Image from 'next/image';
import React from 'react';
import { useMediaQuery } from 'ui';

type HeroImageProps = {
  altText: string;
};

const HeroImage = ({ altText }: HeroImageProps) => {
  const isSmall = useMediaQuery({ minWidth: 'xs', maxWidth: 'sm' });
  return isSmall ? (
    <Image
      alt={altText}
      height={371}
      layout="responsive"
      priority
      src="/images/hero-xs.png"
      width={358}
    />
  ) : (
    <Image
      alt={altText}
      height={682}
      layout="responsive"
      priority
      src="/images/hero.png"
      width={1280}
    />
  );
};

export default HeroImage;
