import { FootprintVerifyButton } from '@onefootprint/footprint-react';
import { useTranslation } from '@onefootprint/hooks';
import { LogoFpDefault } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Grid, media, Stack, Typography } from '@onefootprint/ui';
import { motion } from 'framer-motion';
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
      <BlurredBackground
        align="center"
        justify="center"
        width="100vw"
        minHeight="100vh"
        overflow="hidden"
      >
        <Stack
          direction="column"
          align="center"
          justify="center"
          width="100%"
          height="100%"
          as={motion.div}
        >
          <Stack
            position="absolute"
            width="100%"
            height="100px"
            top={0}
            left={0}
            direction="row"
            justify="center"
            align="center"
          >
            <Link
              href="https://onefootprint.com/"
              target="_blank"
              rel="nonreferrer"
            >
              <LogoFpDefault />
            </Link>
          </Stack>
          <HeroContainer
            maxWidth="90%"
            paddingTop={11}
            paddingBottom={3}
            gap={4}
            columns={['1fr 1fr']}
            rows={['0.3fr 1fr']}
            templateAreas={['image image', 'content content']}
          >
            <TextContainer
              gridArea="content"
              direction="column"
              gap={5}
              textAlign="center"
              justify="center"
            >
              <Typography as="h1" variant="display-2">
                {t(`${translationsKey}.title`)}
              </Typography>
              <Typography as="h1" variant="display-4">
                {t(`${translationsKey}.subtitle`)}
              </Typography>
              <ActionsContainer
                direction="column"
                justify="center"
                gap={6}
                marginTop={6}
              >
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
            <Grid.Item
              align="center"
              gridArea="image"
              justify="center"
              position="relative"
            >
              <ImageOffset>
                <Image
                  src="/live/fl-devices.png"
                  fill
                  alt="footprint wallet"
                  priority
                />
              </ImageOffset>
            </Grid.Item>
          </HeroContainer>
          <Footer />
        </Stack>
      </BlurredBackground>
    </>
  );
};

const HeroContainer = styled(Grid.Container)`
  z-index: 1;
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
`;

const BlurredBackground = styled(Stack)`
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

const TextContainer = styled(Grid.Item)`
  ${({ theme }) => css`
    ${media.greaterThan('md')`
      max-width: 720px;
      text-align: left; 
      padding-right: ${theme.spacing[10]};
    `}
  `}
`;

const ActionsContainer = styled(Stack)`
  ${media.greaterThan('md')`
      max-width: 90%;
      
      & > * {
        width: fit-content;
      }
    `}
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
