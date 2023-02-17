import { useTranslation } from '@onefootprint/hooks';
import { DecryptedIdDoc } from '@onefootprint/types';
import { SegmentedControl } from '@onefootprint/ui';
import Image from 'next/image';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import Pager from './components/pager';

type ImagesPreviewProps = {
  images: DecryptedIdDoc[];
};

const ImagesPreview = ({ images }: ImagesPreviewProps) => {
  const { t, allT } = useTranslation(
    'pages.user-details.user-info.id-doc.preview',
  );
  const [index, setIndex] = useState(0);
  const options = [
    {
      label: allT('collected-id-doc-attributes.id-doc-image'),
      value: 'id-doc',
    },
    {
      label: allT('collected-id-doc-attributes.selfie-image'),
      value: 'selfie',
    },
  ];
  const [segment, setSegment] = useState<string>(options[0].value);
  const selectedImage = images[index];
  const showImageIndex = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  if (!images.length) {
    return null;
  }

  return (
    <Container>
      {selectedImage.selfie && (
        <SegmentedControl
          aria-label={t('segment-control')}
          value={segment}
          onChange={setSegment}
          options={options}
        />
      )}
      <ImagesContainer>
        {segment === options[0].value && (
          <>
            <StyledImage
              src={selectedImage.front}
              width={350}
              height={350}
              alt={t('front-alt')}
            />
            {selectedImage.back && (
              <StyledImage
                src={selectedImage.back}
                width={350}
                height={350}
                alt={t('back-alt')}
              />
            )}
          </>
        )}
        {segment === options[1].value && selectedImage.selfie && (
          <StyledImage
            src={selectedImage.selfie}
            width={350}
            height={350}
            alt={t('front-alt')}
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

const StyledImage = styled(Image)`
  object-fit: contain;
`;

export default ImagesPreview;
