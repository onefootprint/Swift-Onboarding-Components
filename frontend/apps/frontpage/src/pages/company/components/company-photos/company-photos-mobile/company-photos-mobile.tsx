import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import type { CompanyPhoto } from '../company-photos.types';
import Pager from './components/pager';
import useCarouselIndex from './hooks/use-carousel-index';

type CompanyPhotosMobileProps = {
  photos: CompanyPhoto[];
};

const CompanyPhotosMobile = ({ photos }: CompanyPhotosMobileProps) => {
  const carousel = useCarouselIndex(photos.length);
  const selectedPhoto = photos[carousel.index];

  return (
    <Container>
      <StyledImage
        key={selectedPhoto.alt}
        alt={selectedPhoto.alt}
        height={340}
        src={selectedPhoto.src}
        width={358}
        priority
      />
      <PagerContainer>
        <Pager max={photos.length} onClick={carousel.goToIndex} value={carousel.index} />
      </PagerContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    img {
      border-radius: ${theme.borderRadius.default};
    }

    > span {
      width: 100% !important;
    }

    ${media.greaterThan('sm')`
      display: none;
    `}
  `}
`;

const PagerContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    margin-top: ${theme.spacing[4]};
  `}
`;

const StyledImage = styled(Image)`
  object-fit: cover;
`;

export default CompanyPhotosMobile;
