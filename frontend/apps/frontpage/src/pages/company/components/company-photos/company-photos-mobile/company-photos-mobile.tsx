import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';
import { media } from 'ui';

import { CompanyPhoto } from '../company-photos.types';
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
      <Image
        key={selectedPhoto.alt}
        alt={selectedPhoto.alt}
        height={340}
        layout="fixed"
        src={selectedPhoto.src}
        width={358}
        objectFit="cover"
        priority
      />
      <PagerContainer>
        <Pager
          max={photos.length}
          onClick={carousel.goToIndex}
          value={carousel.index}
        />
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
      border-radius: ${theme.borderRadius[2]}px;
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
    margin-top: ${theme.spacing[4]}px;
  `}
`;

export default CompanyPhotosMobile;
