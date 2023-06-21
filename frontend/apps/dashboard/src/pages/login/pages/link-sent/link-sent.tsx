import { useTranslation } from '@onefootprint/hooks';
import { LogoFpDefault } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

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
          <LogoFpDefault />
          <Typography variant="label-1" color="primary">
            {t('title')}
          </Typography>
          <Typography variant="body-2">
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
    gap: ${theme.spacing[7]};
    align-items: center;
  `}
`;

export default LinkSent;
