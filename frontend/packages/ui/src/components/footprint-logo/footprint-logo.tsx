import Image from 'next/image';
import React from 'react';

const DEFAULT_HEIGHT = 26;
const DEFAULT_WIDTH = 120;

export type FootprintLogoProps = {
  alt?: string;
  height?: number;
  width?: number;
};

const FootprintLogo = ({
  alt = 'Footprint Logo',
  height = DEFAULT_HEIGHT,
  width = DEFAULT_WIDTH,
}: FootprintLogoProps) => (
  <Image
    alt={alt}
    src="data:image/png;base64,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"
    height={height}
    width={width}
    priority
    layout="fixed"
  />
);

export default FootprintLogo;
