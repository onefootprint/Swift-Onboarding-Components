import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';
import { media } from 'ui';

import { CompanyPhoto } from '../company-photos.types';

type CompanyPhotosDesktopProps = {
  photos: CompanyPhoto[];
};

const CompanyPhotosDesktop = ({ photos }: CompanyPhotosDesktopProps) => (
  <Container>
    {photos.map(photo => (
      <Image
        key={photo.alt}
        alt={photo.alt}
        height={500}
        layout="fixed"
        src={photo.src}
        width={628}
        objectFit="cover"
        priority
      />
    ))}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('sm')`
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: row;
      gap: ${theme.spacing[7]}px;

      img {
        border-radius: ${theme.borderRadius[2]}px;
      }
    `}

    ${media.greaterThan('lg')`
      margin: 0 -${theme.spacing[12]}px;
    `}
  `}
`;

export default CompanyPhotosDesktop;
