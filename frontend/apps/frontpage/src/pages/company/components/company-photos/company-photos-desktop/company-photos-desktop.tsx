import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import type { CompanyPhoto } from '../company-photos.types';

type CompanyPhotosDesktopProps = {
  photos: CompanyPhoto[];
};

const CompanyPhotosDesktop = ({ photos }: CompanyPhotosDesktopProps) => (
  <Container>
    {photos.map(photo => (
      <StyledImage alt={photo.alt} height={500} key={photo.alt} priority src={photo.src} width={628} />
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
      gap: ${theme.spacing[7]};

      img {
        border-radius: ${theme.borderRadius.default};
      }
    `}

    ${media.greaterThan('lg')`
      margin: 0 -${theme.spacing[12]};
    `}
  `}
`;

const StyledImage = styled(Image)`
  object-fit: cover;
`;

export default CompanyPhotosDesktop;
