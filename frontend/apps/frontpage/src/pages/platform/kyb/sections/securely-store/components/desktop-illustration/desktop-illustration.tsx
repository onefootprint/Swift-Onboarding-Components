import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const DesktopIllustration = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.kyb.securely-store',
  });
  return (
    <ImageContainer>
      <Image src="/kyb/securely-store/kyb.png" width={1037} height={739} alt={t('title')} />
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
