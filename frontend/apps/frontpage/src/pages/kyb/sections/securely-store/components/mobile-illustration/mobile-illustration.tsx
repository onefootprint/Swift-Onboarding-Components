import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

const MobileIllustration = () => {
  const { t } = useTranslation('pages.kyb.securely-store');
  return (
    <ImageFrame>
      <ImageContainer>
        <Image
          src="/kyb/securely-store/kyb.png"
          width={1037}
          height={739}
          alt={t('title')}
        />
      </ImageContainer>
    </ImageFrame>
  );
};

const ImageFrame = styled.div`
  ${({ theme }) => css`
    display: block;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    height: 300px;
    width: 100%;
    position: relative;
    overflow: hidden;

    ${media.greaterThan('md')`
      display: none;
    `};
  `}
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    display: block;
    top: 20px;
    left: 20px;
    height: 200%;
    width: 200%;
    box-shadow: ${theme.elevation[2]};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default MobileIllustration;
