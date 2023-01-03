import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const Illustration1 = () => {
  const { t } = useTranslation('pages.home.everything-you-need-section');
  return (
    <>
      <ImageContainer data-viewport="desktop">
        <Image
          src="/new-home/everything-you-need-section/feature-1/multiple-names.png"
          alt="{t('features.feature-1.alt-1')}"
          height={389}
          width={370}
          data-type="main"
        />
        <Image
          src="/new-home/everything-you-need-section/feature-1/risk-insights.png"
          alt={t('features.feature-1.alt-1')}
          height={358}
          width={659}
          data-type="background"
        />
      </ImageContainer>

      <ImageContainer data-viewport="tablet">
        <Image
          src="/new-home/everything-you-need-section/feature-1/multiple-names.png"
          alt={t('features.feature-1.alt-1')}
          height={528}
          width={502.4}
          data-type="main"
        />
        <Image
          src="/new-home/everything-you-need-section/feature-1/risk-insights.png"
          alt={t('features.feature-1.alt-1')}
          height={358}
          width={659}
          data-type="background"
        />
      </ImageContainer>

      <ImageContainer data-viewport="mobile">
        <Image
          src="/new-home/everything-you-need-section/feature-1/multiple-names.png"
          alt={t('features.feature-1.alt-1')}
          height={330}
          width={314}
          data-type="main"
        />
        <Image
          src="/new-home/everything-you-need-section/feature-1/risk-insights.png"
          alt={t('features.feature-1.alt-1')}
          height={358}
          width={659}
          data-type="background"
        />
      </ImageContainer>
    </>
  );
};

const ImageContainer = styled.div`
  ${({ theme }) => css`
    position: relative;

    &[data-viewport='desktop'] [data-type='main'] {
      display: none;
      position: absolute;
      top: 0;
      right: 0px;
      z-index: 1;
      box-shadow: ${theme.elevation[2]};
      border-radius: ${theme.borderRadius.default};
      overflow: hidden;

      ${media.greaterThan('md')`
        display: block;
      `}
    }

    &[data-viewport='desktop'] [data-type='background'] {
      display: none;
      position: absolute;
      left: 0;
      top: ${theme.spacing[10]};
      z-index: 0;

      ${media.greaterThan('md')`
        display: block;
      `}
    }

    &[data-viewport='tablet'] [data-type='main'] {
      display: none;
      position: absolute;
      top: 0;
      right: 0%;
      z-index: 1;
      box-shadow: ${theme.elevation[2]};

      ${media.greaterThan('sm')`
        display: block;
      `}

      ${media.greaterThan('md')`
        display: none;
      `}
    }

    &[data-viewport='tablet'] [data-type='background'] {
      display: none;
      position: absolute;
      left: 0%;
      top: ${theme.spacing[10]};
      z-index: 0;

      ${media.greaterThan('sm')`
        display: block;
      `}

      ${media.greaterThan('md')`
        display: none;
      `}
    }

    &[data-viewport='mobile'] [data-type='main'] {
      display: block;
      position: absolute;
      top: -80px;
      right: -80px;
      z-index: 1;
      box-shadow: ${theme.elevation[1]};

      ${media.greaterThan('sm')`
        display: none;
      `}
    }

    &[data-viewport='mobile'] [data-type='background'] {
      position: absolute;
      left: -40px;
      top: -30px;
      z-index: 0;

      ${media.greaterThan('sm')`
        display: none;
      `}
    }
  `}
`;

export default Illustration1;
