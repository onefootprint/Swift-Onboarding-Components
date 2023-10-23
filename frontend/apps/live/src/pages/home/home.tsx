import { FootprintVerifyButton } from '@onefootprint/footprint-react';
import { useTranslation } from '@onefootprint/hooks';
import { LogoFpDefault } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import SEO from '../../components/seo';
import Footer from './components/footer';

const kycPublicKey = process.env.NEXT_PUBLIC_KYC_TENANT_KEY ?? '';
const kybPublicKey = process.env.NEXT_PUBLIC_KYB_TENANT_KEY ?? '';
const kycIdDocPublicKey = process.env.NEXT_PUBLIC_KYC_ID_DOC_TENANT_KEY ?? '';

const Live = () => {
  const { t } = useTranslation('home');
  const router = useRouter();
  const type = router?.query.type;

  const getPublicKey = (): string => {
    switch (type) {
      case 'kyb':
        return kybPublicKey;
      case 'kyc-id-doc':
        return kycIdDocPublicKey;
      default:
        return kycPublicKey;
    }
  };

  const publicKey = getPublicKey();
  const translationsKey = type === 'kyb' ? 'kyb' : 'kyc';

  return (
    <>
      <SEO title={t(`${translationsKey}.html-title`)} />
      <BlurredBackground>
        <Wrapper>
          <Nav>
            <Link
              href="https://onefootprint.com/"
              target="_blank"
              rel="nonreferrer"
            >
              <LogoFpDefault />
            </Link>
          </Nav>
          <HeroContainer>
            <TextContainer>
              <Typography as="h1" variant="display-2">
                {t(`${translationsKey}.title`)}
              </Typography>
              <Typography as="h1" variant="display-4">
                {t(`${translationsKey}.subtitle`)}
              </Typography>
              <ActionsContainer>
                <FootprintVerifyButton
                  publicKey={publicKey}
                  label={t(`${translationsKey}.cta`)}
                  onComplete={() => {
                    router.push('/ending');
                  }}
                />
                <Typography as="p" variant="body-2" color="secondary">
                  {t(`${translationsKey}.disclaimer`)}
                </Typography>
              </ActionsContainer>
            </TextContainer>
            <ImageContainer>
              <ImageOffset>
                <Image
                  src="/live/fl-devices.png"
                  fill
                  alt="footprint wallet"
                  priority
                />
              </ImageOffset>
            </ImageContainer>
          </HeroContainer>
          <Footer />
        </Wrapper>
      </BlurredBackground>
    </>
  );
};

const BlurredBackground = styled.div`
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
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

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Nav = styled.nav`
  width: 100%;
  height: 100px;
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const HeroContainer = styled.div`
  ${({ theme }) => css`
    z-index: 1;
    padding: ${theme.spacing[11]} 0 ${theme.spacing[3]} 0;
    max-width: 90%;
    display: grid;
    gap: ${theme.spacing[4]};
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 0.3fr 1fr;
    grid-template-areas:
      'image image'
      'content content';

    ${media.greaterThan('md')`
      margin: 0;
      grid-template-areas: 
      'content image'
      'content image';
    `};

    ${media.greaterThan('lg')`
      max-width: 1256px;
    `}
  `}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    grid-area: content;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    text-align: center;
    justify-content: center;

    ${media.greaterThan('md')`
      max-width: 720px;
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

    ${media.greaterThan('md')`
      max-width: 90%;
      
      & > * {
        width: fit-content;
      }
    `}
  `}
`;

const ImageContainer = styled.div`
  grid-area: image;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageOffset = styled.div`
  position: relative;
  width: 100%;
  height: 340px;

  img {
    object-fit: contain;
  }

  ${media.greaterThan('md')`
      align-self: center;
      position: absolute;
      left: 0;
      width: 800px;
      height: 720px;
  `};
`;

export default Live;
