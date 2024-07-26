import { ThemedLogoFpCompact } from '@onefootprint/icons';
import { Box, Divider, Stack, Text, media } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Blur from '../components/blur';
import ContainerBox from '../components/container-box';
import EmailForm from '../components/email-form';
import Layout from '../components/layout';
import SocialButtons from '../components/social-buttons';
import SkatingPenguin from './components/skating-penguin';
import useCaptureQueryParams from './hooks/use-capture-query-params';

const Login = () => {
  const { t } = useTranslation('authentication', { keyPrefix: 'sign-in' });
  useCaptureQueryParams();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Layout>
        <Container position="relative" width="100%">
          <PenguinImageContainer>
            <SkatingPenguin />
          </PenguinImageContainer>
          <StyledBlur />
          <ContainerBox>
            <ThemedLogoFpCompact color="primary" />
            <Text variant="label-2">{t('title')}</Text>
            <SocialButtons />
            <Stack direction="row" center gap={4}>
              <Divider />
              <Text variant="body-4" color="tertiary">
                {t('or')}
              </Text>
              <Divider />
            </Stack>
            <EmailForm />
            <Text color="secondary" variant="body-4" gap={2} display="inline-flex">
              <span>{t('do-not-have-an-account')}</span>
              <Link href="/authentication/sign-up">{t('sign-up')}</Link>
            </Text>
          </ContainerBox>
        </Container>
      </Layout>
    </>
  );
};

const Container = styled(Box)`
  position: relative;
  width: 100%;

  ${media.greaterThan('sm')`
    width: 410px;
  `}
`;

const PenguinImageContainer = styled(Box)`
  width: 100px;
  height: fit-content;
  position: absolute;
  transform: translateY(-100%);
  right: 48px;
  top: 3px;
  z-index: 0;

  img {
    object-fit: contain;
    width: 100%;
    height: 100%;
  }
`;

const StyledBlur = styled(Blur)`
  position: absolute;
  transform: translate(-50%, -50%);
  top: 20%;
  left: 80%;
  z-index: -2;
  filter: blur(80px);
  -webkit-filter: blur(80px);
  opacity: 0.05;
`;

export default Login;
