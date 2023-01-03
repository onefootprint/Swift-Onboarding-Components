import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const Illustration2 = () => {
  const { t } = useTranslation('pages.home.everything-you-need-section');

  return (
    <ImageContainer>
      <Image
        src="/new-home/everything-you-need-section/feature-2/security-logs.png"
        alt={t('features.feature-2.alt')}
        height={446}
        width={698}
        id="main-image"
      />
    </ImageContainer>
  );
};

const ImageContainer = styled.div`
  position: relative;

  #main-image {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;

    ${media.greaterThan('sm')`
      transform: translate(-50%, 0%);
      left: 50%;
      top: 0;
    `}

    ${media.greaterThan('md')`
      transform: translate(0%, 0%);
      top: 0;
      left: 0;
    `}
  }
`;

export default Illustration2;
