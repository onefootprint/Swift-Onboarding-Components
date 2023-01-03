import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const Illustration4 = () => {
  const { t } = useTranslation('pages.home.everything-you-need-section');

  return (
    <>
      <ImageContainer data-viewport="desktop">
        <Image
          src="/new-home/everything-you-need-section/feature-4/create-role.png"
          alt={t('features.feature-4.alt-1')}
          height={405}
          width={393}
          data-type="main"
        />
        <Image
          src="/new-home/everything-you-need-section/feature-4/table-view.png"
          alt={t('features.feature-4.alt-2')}
          height={285}
          width={800}
          data-type="background"
        />
      </ImageContainer>
      <ImageContainer data-viewport="tablet">
        <Image
          src="/new-home/everything-you-need-section/feature-4/create-role.png"
          alt={t('features.feature-4.alt-1')}
          height={457.5}
          width={444}
          data-type="main"
        />
        <Image
          src="/new-home/everything-you-need-section/feature-4/table-view.png"
          alt={t('features.feature-4.alt-2')}
          height={285}
          width={800}
          data-type="background"
        />
      </ImageContainer>
      <ImageContainer data-viewport="mobile">
        <Image
          src="/new-home/everything-you-need-section/feature-4/create-role.png"
          alt={t('features.feature-4.alt-1')}
          height={305}
          width={296}
          data-type="main"
        />
        <Image
          src="/new-home/everything-you-need-section/feature-4/table-view.png"
          alt={t('features.feature-4.alt-2')}
          height={285}
          width={800}
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
      box-shadow: ${theme.elevation[1]};
      border-radius: 6px 6px 0 0; //not variable bc it's related to the image
      overflow: hidden;
      display: none;
      position: absolute;
      transform: translate(-50%, 0);
      top: 0;
      left: 50%;
      z-index: 2;

      ${media.greaterThan('md')`
        display: block; 
      `}
    }

    &[data-viewport='desktop'] [data-type='background'] {
      display: none;
      position: absolute;
      left: -10%;
      bottom: -360px;

      ${media.greaterThan('md')`
        display: block; 
      `}
    }

    &[data-viewport='tablet'] [data-type='main'] {
      border-radius: 6px 6px 0 0; //not variable bc it's related to the image
      overflow: hidden;
      box-shadow: ${theme.elevation[1]};
      display: none;
      position: absolute;
      transform: translate(-50%, 0);
      top: 0;
      left: 50%;
      z-index: 2;

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
      bottom: -360px;

      ${media.greaterThan('sm')`
        display: block;
      `}

      ${media.greaterThan('md')`
        display: none;
      `}
    }

    &[data-viewport='mobile'] [data-type='main'] {
      box-shadow: ${theme.elevation[1]};
      border-radius: 6px 6px 0 0; //not variable bc it's related to the image
      overflow: hidden;
      display: block;
      position: absolute;
      transform: translate(-50%, 0);
      top: -90px;
      left: 50%;
      z-index: 2;

      ${media.greaterThan('sm')`
        display: none;
      `}
    }

    &[data-viewport='mobile'] [data-type='background'] {
      display: block;
      position: absolute;
      left: -10%;
      bottom: -300px;

      ${media.greaterThan('sm')`
        display: none;
      `}
    }
  `}
`;

export default Illustration4;
