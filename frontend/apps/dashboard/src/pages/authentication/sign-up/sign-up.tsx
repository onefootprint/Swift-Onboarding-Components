import { ThemedLogoFpCompact } from '@onefootprint/icons';
import { Box, Divider, Stack, Text, media } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Blur from '../components/blur';
import ContainerBox from '../components/container-box';
import EmailForm from '../components/email-form';
import Layout from '../components/layout';
import SocialButtons from '../components/social-buttons';
import PenguinWink from './components/penguin-wink';

const Signup = () => {
  const { t } = useTranslation('authentication', { keyPrefix: 'sign-up' });

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Layout>
        <Container>
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
              <span>{t('already-have-an-account')}</span>
              <Link href="/authentication/sign-in">{t('sign-in')}</Link>
            </Text>
          </ContainerBox>
          <StyledBlur />
          <PenguinImageContainer>
            <PenguinWink />
          </PenguinImageContainer>
        </Container>
        <Text variant="caption-3" color="secondary" width="350px" textAlign="center">
          <Trans
            ns="authentication"
            i18nKey="sign-up.terms"
            components={{
              terms: <Link href="https://onefootprint.com/terms-of-service" target="_blank" />,
              privacy: <Link href="https://onefootprint.com/privacy-policy" target="_blank" />,
            }}
          />
        </Text>
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
  width: 140px;
  height: fit-content;
  position: absolute;
  transform: translateY(-100%);
  right: 30px;
  top: 8px;
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
  top: 10%;
  left: 0;
  z-index: -2;
  filter: blur(80px);
  -webkit-filter: blur(80px);
  opacity: 0.05;
`;

export default Signup;
