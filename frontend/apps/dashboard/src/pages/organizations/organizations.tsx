import { useTranslation } from '@onefootprint/hooks';
import { LogoFpDefault } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

import Data from './components/data';
import Error from './components/error';
import Loading from './components/loading';
import useGetRoles from './hooks/use-get-roles';

const Organizations = () => {
  const { t } = useTranslation('pages.organizations');
  const { query, isReady } = useRouter();
  const authToken = isReady ? (query.token as string) : '';
  const hasToken = isReady && authToken;
  const { isLoading, error, data } = useGetRoles(authToken);

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Container>
        <Inner aria-busy={isLoading} aria-live="polite">
          {hasToken ? (
            <>
              <Box>
                <LogoFpDefault />
              </Box>
              {isLoading && <Loading />}
              {error && <Error message={getErrorMessage(error)} />}
              {data && <Data authToken={authToken} organizations={data} />}
            </>
          ) : (
            <Error message={t('errors.no-auth-token')} />
          )}
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
`;

const Inner = styled.div`
  ${({ theme }) => css`
    width: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: ${theme.spacing[5]};
  `}
`;

export default Organizations;
