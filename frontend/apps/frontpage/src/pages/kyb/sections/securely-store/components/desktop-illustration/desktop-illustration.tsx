import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

const DesktopIllustration = () => {
  const { t } = useTranslation('pages.kyb.securely-store');
  return (
    <ImageContainer>
      <Image
        src="/kyb/securely-store/business-tab.png"
        width={1037}
        height={739}
        alt={t('title')}
      />
    </ImageContainer>
  );
};

const ImageContainer = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      display: block;
      padding-right: ${theme.spacing[10]};

      img {
        width: 100%;
        height: auto;
        object-fit: contain;
      }
    `}
  `}
`;

export default DesktopIllustration;
