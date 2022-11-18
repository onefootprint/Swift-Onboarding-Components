import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

type ImgProps = {
  alt: string;
  height: number;
  src: string;
  title: string;
  width: number;
};

const img = ({ alt, src, title, width, height }: ImgProps) => (
  <StyledImage
    alt={alt}
    src={src}
    title={title}
    width={width}
    height={height}
  />
);

const StyledImage = styled(Image)`
  object-fit: contain;
`;

export default img;
