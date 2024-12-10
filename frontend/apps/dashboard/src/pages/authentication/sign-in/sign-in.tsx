import { ThemedLogoFpCompact } from '@onefootprint/icons';
import { Box, Divider, Text, media } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { IS_DEV } from '@onefootprint/global-constants';
import AuthTokenForm from '../components/auth-token-form';
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
            <div className="flex flex-row items-center gap-4">
              <Divider />
              <div className="text-body-3 text-tertiary">{t('or')}</div>
              <Divider />
            </div>
            <EmailForm />
            <div className="flex flex-row items-center gap-2 text-body-3 text-tertiary">
              <span>{t('do-not-have-an-account')}</span>
              <Link href="/authentication/sign-up">{t('sign-up')}</Link>
            </div>
            {IS_DEV && (
              <>
                <div className="flex flex-row items-center gap-4">
                  <Divider />
                  <div className="text-body-3 text-tertiary">{t('or')}</div>
                  <Divider />
                </div>
                <AuthTokenForm />
              </>
            )}
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
