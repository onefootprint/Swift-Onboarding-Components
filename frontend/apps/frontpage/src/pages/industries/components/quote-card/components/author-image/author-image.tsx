import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

interface AuthorImageProps {
  src: string;
  alt: string;
}

const SIZE = 80;

const AuthorImage = ({ src, alt }: AuthorImageProps) => (
  <StyledAuthorImage>
    <StyledImage src={src} alt={alt} width={200} height={200} />
  </StyledAuthorImage>
);

const StyledAuthorImage = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: ${theme.elevation[3]};
    width: ${SIZE}px;
    height: ${SIZE}px;
    transform: rotate(-3deg);
    padding: ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
  `}
`;

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    object-fit: cover;
    object-position: center;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  `}
`;

export default AuthorImage;
