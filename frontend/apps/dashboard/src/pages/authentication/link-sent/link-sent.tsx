import { ThemedLogoFpCompact } from '@onefootprint/icons';
import { Box, Stack, Text, media } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ContainerBox from '../components/container-box';
import Layout from '../components/layout';
import PenguinWink from './components/penguin-wink';

const LinkSent = () => {
  const { t } = useTranslation('authentication', { keyPrefix: 'link-sent' });
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Layout>
        <Container>
          <ContainerBox>
            <ThemedLogoFpCompact color="primary" />
            <Stack center gap={5} direction="column" align="center">
              <Text variant="label-2">{t('title')}</Text>
              <Text variant="body-2" textAlign="center" color="secondary" maxWidth="350px">
                <Trans
                  ns="authentication"
                  i18nKey="link-sent.instructions"
                  values={{ email: router.query.email }}
                  components={{
                    b: <Text variant="label-2" tag="span" color="primary" />,
                  }}
                />
              </Text>
            </Stack>
          </ContainerBox>
          <PenguinImageContainer>
            <PenguinWink />
          </PenguinImageContainer>
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
  width: 140px;
  height: fit-content;
  position: absolute;
  transform: translateY(-100%);
  right: 30px;
  top: 2px;
  z-index: 0;

  img {
    object-fit: contain;
    width: 100%;
    height: 100%;
  }
`;

export default LinkSent;
