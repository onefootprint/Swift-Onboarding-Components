import { useTranslation } from '@onefootprint/hooks';
import { Button, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';

import LogoAndText from '../../components/logo-and-text';

const LinkSent = () => {
  const { t } = useTranslation('pages.link-sent');
  const router = useRouter();
  const { email } = router.query;

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Container>
        <Inner>
          <LogoAndText text={t('title')} />
          <Typography variant="body-2" sx={{ marginBottom: 8 }}>
            {t('instructions', { email })}
          </Typography>
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
    row-gap: ${theme.spacing[4]};
  `}
`;

export default LinkSent;
