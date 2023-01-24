import { useTranslation } from '@onefootprint/hooks';
import { DecryptedIdDoc } from '@onefootprint/types';
import Image from 'next/legacy/image';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import Pager from './components/pager';

type ImagesPreviewProps = {
  images: DecryptedIdDoc[];
};

const ImagesPreview = ({ images }: ImagesPreviewProps) => {
  const { t } = useTranslation('pages.user-details.user-info.id-doc.preview');
  const [index, setIndex] = useState(0);
  const selectedImage = images[index];
  const showImageIndex = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  return (
    <Container>
      <ImagesContainer>
        <Image
          src={selectedImage.front}
          width={350}
          height={350}
          layout="fixed"
          alt={t('front-alt')}
        />
        {selectedImage.back && (
          <Image
            src={selectedImage.back}
            width={350}
            height={350}
            layout="fixed"
            alt={t('back-alt')}
          />
        )}
      </ImagesContainer>
      {images.length > 1 && (
        <Pager max={images.length} onClick={showImageIndex} value={index} />
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[6]};
  `};
`;

const ImagesContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[6]};
  `};
`;

export default ImagesPreview;
