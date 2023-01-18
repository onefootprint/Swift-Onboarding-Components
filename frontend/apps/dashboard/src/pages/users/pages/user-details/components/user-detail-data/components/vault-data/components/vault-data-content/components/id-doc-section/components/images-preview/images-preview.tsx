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
  const [index, setIndex] = useState(0);
  const { t } = useTranslation('pages.user-details.user-info.id-doc.preview');
  if (!images.length) {
    return null;
  }

  const selectedImage = images[index];
  const showImageIndex = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  return (
    <PreviewArea>
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
    </PreviewArea>
  );
};

const PreviewArea = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[6]};
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
