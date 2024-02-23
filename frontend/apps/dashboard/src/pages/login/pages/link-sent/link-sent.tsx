import { ThemedLogoFpDefault } from '@onefootprint/icons';
import { Button, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const LinkSent = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.link-sent' });
  const router = useRouter();
  const { email } = router.query;

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Container>
        <Inner>
          <ThemedLogoFpDefault />
          <Text variant="label-1" color="primary">
            {t('title')}
          </Text>
          <Text variant="body-2">{t('instructions', { email })}</Text>
          <Button onClick={() => router.push('/login')} fullWidth>
            {t('cta')}
          </Button>
        </Inner>
      </Container>
    </>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  text-align: center;
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    max-width: 350px;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    align-items: center;
  `}
`;

export default LinkSent;
