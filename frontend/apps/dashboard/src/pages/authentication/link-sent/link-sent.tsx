import { ThemedLogoFpCompact } from '@onefootprint/icons';
import { Box, Stack, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

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
        <Box
          backgroundColor="primary"
          borderRadius="lg"
          borderWidth={1}
          borderStyle="solid"
          borderColor="tertiary"
          padding={8}
          elevation={1}
          position="relative"
        >
          <Stack width="398px" direction="column" gap={7}>
            <ThemedLogoFpCompact color="primary" />
            <Stack center gap={5} direction="column" align="center">
              <Text variant="label-2">{t('title')}</Text>
              <Text
                variant="body-2"
                textAlign="center"
                color="secondary"
                maxWidth="350px"
              >
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
          </Stack>
          <PenguinImageContainer>
            <PenguinWink />
          </PenguinImageContainer>
        </Box>
      </Layout>
    </>
  );
};

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
