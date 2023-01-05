import { FootprintButton } from '@onefootprint/footprint-react';
import { useTranslation } from '@onefootprint/hooks';
import { LinkButton, media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';

const publicKey = 'ob_test_CnzlAM1i4ce9IV5EsIxFbn';

const FootprintLive = () => {
  const { t } = useTranslation('pages.footprint-live');

  return (
    <>
      <SEO title={t('html-title')} slug="/footprint-live" />
      <Container>
        <BlurredBackground />
        <HeroContainer>
          <ContentSection>
            <Typography as="h1" variant="display-2">
              {t('title')}
            </Typography>
            <Typography as="h1" variant="display-4">
              {t('subtitle')}
            </Typography>
            <ActionsContainer>
              <FootprintButton publicKey={publicKey} label={t('cta')} />
              <LinkButton>Try the sandbox</LinkButton>
            </ActionsContainer>
            <PromoSentence>
              <Typography as="p" variant="caption-2">
                {t('promo')}
              </Typography>
            </PromoSentence>
          </ContentSection>
          <ImageSection>
            <ImageOffset>
              <Image
                src="/footprint-live/fl-devices.png"
                fill
                alt="footprint wallet"
                priority
              />
            </ImageOffset>
          </ImageSection>
        </HeroContainer>
      </Container>
    </>
  );
};

const Container = styled.div`
  max-width: 95%;
  margin: auto;
  isolation: isolate;
  display: flex;
  justify-content: center;
  align-items: center;

  ${media.greaterThan('lg')`
      max-width: 1256px;
      height: calc(100vh - 80px);
  `}
`;

const HeroContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 0.3fr 1fr;
    grid-template-areas:
      'image image'
      'content content';
    gap: ${theme.spacing[4]};
    padding-bottom: ${theme.spacing[11]};
    min-height: calc(100vh - var(--desktop-header-height) * 3);

    ${media.greaterThan('md')`
      grid-template-rows: 1fr 1fr;
    `};

    ${media.greaterThan('lg')`
      grid-template-areas: 
      'content image'
      'content image';
    `};
  `}
`;

const ContentSection = styled.div`
  ${({ theme }) => css`
    grid-area: content;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    z-index: 2;
    text-align: center;
    justify-content: center;

    ${media.greaterThan('lg')`
      text-align: left; 
      padding-right: ${theme.spacing[10]};
    `}
  `}
`;

const ActionsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${theme.spacing[6]};
    margin-top: ${theme.spacing[6]};
    & > * {
      margin: auto;
    }

    ${media.greaterThan('lg')`
      justify-content: flex-start;
      flex-direction: row;
      & > * {
        margin: 0;
      }
    `}
  `}
`;

const PromoSentence = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]} 0;
  `}
`;

const ImageSection = styled.div`
  grid-area: image;
  position: relative;
  display: flex;
  justify-content: left;
  align-items: center;
`;

const ImageOffset = styled.div`
  position: relative;
  display: flex;
  align-self: flex-end;
  width: 100%;
  height: 340px;

  img {
    object-fit: contain;
  }

  ${media.greaterThan('lg')`
      align-self: center;
      position: absolute;
      left: 0;
      width: 1100px;
      height: 720px;
  `};
`;

const BlurredBackground = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      180deg,
      rgba(176, 255, 191, 0.4) 0%,
      rgba(176, 255, 191, 0) 100%
    ),
    radial-gradient(at 50% 15%, #e5f6c1 2%, rgba(255, 255, 255, 0) 50%),
    radial-gradient(at 0% 60%, #cbc1f6 0%, rgba(255, 255, 255, 0) 80%),
    radial-gradient(at 0% 0%, #c1c2f6 0%, rgba(255, 255, 255, 0) 48%),
    radial-gradient(at 100% 0%, #c8e4ff 0%, rgba(200, 228, 255, 0) 40%),
    linear-gradient(180deg, #b0ffbf 0%, rgba(176, 255, 191, 0) 100%);
  overflow: hidden;

  :after {
    content: '';
    position: absolute;
    background-image: url('/footprint-live/noise.png');
    width: 100%;
    height: 100%;
    opacity: 5%;
  }
`;

export default FootprintLive;
