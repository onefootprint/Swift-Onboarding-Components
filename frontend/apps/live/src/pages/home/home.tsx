import { FootprintVerifyButton } from '@onefootprint/footprint-react';
import { useTranslation } from '@onefootprint/hooks';
import { LogoFpDefault } from '@onefootprint/icons';
import styled, { css, useTheme } from '@onefootprint/styled';
import { media, Stack, Typography } from '@onefootprint/ui';
import { easeIn, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import Balancer from 'react-wrap-balancer';

import SEO from '../../components/seo';
import FooterLinks from './components/footer-links';
import Illustration from './components/illustration';

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
  const theme = useTheme();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5,
      },
      delay: 0.05,
    },
  };
  const childrenVariants = {
    hidden: { opacity: 0, x: -5, filter: 'blur(5px)', transform: 'scale(1.1)' },
    visible: {
      opacity: 1,
      transform: 'scale(1)',
      x: 0,
      filter: 'blur(0px)',
      transition: { ease: easeIn, duration: 0.5 },
    },
  };
  const illustrationVariants = {
    hidden: { filter: 'blur(10px)', opacity: 0, transform: 'scale(1.1)' },
    visible: {
      filter: 'blur(0px)',
      transform: 'scale(1)',
      opacity: 1,
      transition: { delay: 0.1, duration: 0.5 },
    },
  };

  return (
    <>
      <SEO title={t(`${translationsKey}.html-title`)} />
      <FullContainer direction="column">
        <Stack
          height={theme.spacing[10]}
          width="100%"
          align="center"
          justify="center"
        >
          <Link
            href="https://onefootprint.com/"
            target="_blank"
            rel="nonreferrer"
          >
            <LogoFpDefault />
          </Link>
        </Stack>
        <InnerContent
          direction="row"
          flexWrap="wrap-reverse"
          flexGrow={2}
          align="center"
          justify="center"
          gap={10}
        >
          <Balancer>
            <TextContainer
              align="start"
              direction="column"
              gap={5}
              as={motion.span}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Stack as={motion.span} variants={childrenVariants}>
                <Typography as="h1" variant="display-2">
                  {t(`${translationsKey}.title`)}
                </Typography>
              </Stack>
              <Stack as={motion.span} variants={childrenVariants}>
                <Typography as="h1" variant="display-4">
                  {t(`${translationsKey}.subtitle`)}
                </Typography>
              </Stack>
              <Stack as={motion.span} variants={childrenVariants}>
                <FootprintVerifyButton
                  publicKey={publicKey}
                  label={t(`${translationsKey}.cta`)}
                  onComplete={() => {
                    router.push('/ending');
                  }}
                />
              </Stack>
              <Stack as={motion.span} variants={childrenVariants}>
                <Typography
                  as="p"
                  variant="body-2"
                  color="tertiary"
                  sx={{
                    maxWidth: '520px',
                  }}
                >
                  {t(`${translationsKey}.disclaimer`)}
                </Typography>
              </Stack>
            </TextContainer>
          </Balancer>
          <IllustrationContainer
            align="center"
            justify="center"
            padding={7}
            as={motion.span}
            variants={illustrationVariants}
            initial="hidden"
            animate="visible"
          >
            <Illustration />
          </IllustrationContainer>
        </InnerContent>
        <Stack
          direction="row"
          justify="center"
          gap={5}
          height={theme.spacing[9]}
        >
          <FooterLinks />
        </Stack>
      </FullContainer>
    </>
  );
};

const FullContainer = styled(Stack)`
  ${({ theme }) => css`
    min-height: 100vh;
    overflow: hidden;
    background: linear-gradient(
      180deg,
      ${theme.backgroundColor.primary} 0%,
      ${theme.backgroundColor.secondary} 100%
    );

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('/noise.svg');
      background-size: 300px 300px;
      background-repeat: repeat;
      mix-blend-mode: multiply;
      opacity: 0.2;
      mask: linear-gradient(180deg, transparent 0%, black 100%);
      mask-mode: alpha;
    }
  `}
`;

const IllustrationContainer = styled(Stack)`
  height: 720px;
  width: 100%;

  ${media.greaterThan('md')`
    height: 800px;
    width: 600px;
  `}
`;

const TextContainer = styled(Stack)`
  max-width: 600px;
  text-align: center;
  align-items: center;

  button {
    width: 100%;
  }

  ${media.greaterThan('md')`
    text-align: left;
    align-items: flex-start;
  `}
`;

const InnerContent = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[7]};

    ${media.greaterThan('md')`
      padding: ${theme.spacing[7]}
    `};
  `}
`;
export default Live;
