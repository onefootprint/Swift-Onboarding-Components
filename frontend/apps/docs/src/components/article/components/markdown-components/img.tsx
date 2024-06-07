import { useTheme } from 'next-themes';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

type ImgProps = {
  alt: string;
  height: number;
  src: string;
  title: string;
  width: number;
};

const img = ({ alt, src, title, width, height }: ImgProps) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { theme } = useTheme();
  const parts = src.split('/');
  const filename = parts.pop();
  const themedPath = `${parts.join('/')}/${theme}/${filename}`;

  return <StyledImage alt={alt} src={themedPath} title={title} width={width} key={themedPath} height={height} />;
};

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    object-fit: contain;
    max-width: 100%;
    height: auto;
    background-color: ${theme.backgroundColor.secondary};
  `}
`;

export default img;
