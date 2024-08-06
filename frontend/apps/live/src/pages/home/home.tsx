import footprint from '@onefootprint/footprint-js';
import { LogoFpDefault } from '@onefootprint/icons';
import { FootprintButton, Stack, Text, media } from '@onefootprint/ui';
import { easeIn, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styled, { css, useTheme } from 'styled-components';

import SEO from '../../components/seo';
import FooterLinks from './components/footer-links';
import Illustration from './components/illustration';

const kycPublicKey = process.env.NEXT_PUBLIC_KYC_TENANT_KEY ?? '';
const kybPublicKey = process.env.NEXT_PUBLIC_KYB_TENANT_KEY ?? '';
const kycIdDocPublicKey = process.env.NEXT_PUBLIC_KYC_ID_DOC_TENANT_KEY ?? '';

const Live = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home' });
  const router = useRouter();
  const theme = useTheme();
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

  const handleOpen = () => {
    const component = footprint.init({
      kind: 'verify',
      publicKey: getPublicKey(),
      onComplete: () => {
        router.push('/ending');
      },
    });

    component.render();
  };

  const translationsKey = type === 'kyb' ? 'kyb' : 'kyc';
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
        <Stack height={theme.spacing[10]} width="100%" align="center" justify="center">
          <Link href="https://onefootprint.com/" target="_blank" rel="nonreferrer">
            <LogoFpDefault />
          </Link>
        </Stack>
        <InnerContent direction="row" flexWrap="wrap-reverse" align="center" justify="center" gap={10}>
          <TextContainer
            align="start"
            direction="column"
            gap={5}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <MotionStack variants={childrenVariants}>
              <Text tag="h1" variant="display-2">
                {t(`${translationsKey}.title`)}
              </Text>
            </MotionStack>
            <MotionStack variants={childrenVariants}>
              <Text tag="h2" variant="display-4">
                {t(`${translationsKey}.subtitle`)}
              </Text>
            </MotionStack>
            <MotionStack variants={childrenVariants}>
              <FootprintButton onClick={handleOpen} />
            </MotionStack>
            <MotionStack variants={childrenVariants}>
              <Text tag="p" variant="body-2" color="tertiary" maxWidth="520px">
                {t(`${translationsKey}.disclaimer`)}
              </Text>
            </MotionStack>
          </TextContainer>
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
        <Stack direction="row" justify="center" gap={5} height={theme.spacing[9]}>
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

const MotionStack = styled(motion.span)`
  display: flex;
`;

const IllustrationContainer = styled(Stack)`
  height: 720px;
  width: 100%;

  ${media.greaterThan('md')`
    height: 800px;
    width: 600px;
  `}
`;

const TextContainer = styled(motion(Stack))`
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
    flex-grow: 1;
    width: 100%;
    padding: ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[7]};

    ${media.greaterThan('md')`
      padding: ${theme.spacing[7]}
    `};
  `}
`;
export default Live;
