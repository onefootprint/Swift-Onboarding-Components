import { useTranslation } from '@onefootprint/hooks';
import { LogoFpDefault } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import TermsAndConditions from 'src/components/terms-and-conditions';
import styled, { css } from 'styled-components';

import Data from './components/data';
import Error from './components/error';
import Loading from './components/loading';
import useGetRoles from './hooks/use-get-roles';

const Organizations = () => {
  const { t } = useTranslation('pages.organizations');
  const { query, isReady } = useRouter();
  const authToken = isReady ? (query.token as string) : '';
  const rolesQuery = useGetRoles(authToken);

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Container>
        <LogoFpDefault />
        <Inner>
          <>
            {isReady && !authToken && (
              <Error message={t('errors.no-auth-token')} />
            )}
            {rolesQuery.isLoading && <Loading />}
            {rolesQuery.error && (
              <Error message={getErrorMessage(rolesQuery.error)} />
            )}
            {rolesQuery.data && (
              <Data authToken={authToken} organizations={rolesQuery.data} />
            )}
            <TermsAndConditions />
          </>
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
    row-gap: ${theme.spacing[5]};
  `}
`;

export default Organizations;
