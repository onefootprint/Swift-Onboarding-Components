import { ThemedLogoFpDefault } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import { Box, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useAuthRoles from 'src/hooks/use-auth-roles';
import useLoggedOutStorage from 'src/hooks/use-logged-out-storage';
import styled, { css } from 'styled-components';

import Data from './components/data';
import ErrorComponent from './components/error';
import Loading from './components/loading';

const Organizations = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.organizations' });
  const { query, isReady } = useRouter();
  const authToken = isReady ? (query.token as string) : '';
  const hasToken = isReady && authToken;
  const { isLoading, error, data } = useAuthRoles(authToken);
  const {
    data: { orgId },
  } = useLoggedOutStorage();
  // If we make it to the org selector screen with an orgId, it means we didn't have access to log
  // into the requested org
  const isMissingAccessToRequestedOrg = !!orgId;

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
                <ThemedLogoFpDefault color="primary" />
              </Box>
              {isMissingAccessToRequestedOrg && (
                <Box textAlign="center">
                  <Text variant="body-3">{t('no-access-to-requested-org')}</Text>
                </Box>
              )}
              {isLoading && !isMissingAccessToRequestedOrg && <Loading />}
              {error && <ErrorComponent message={getErrorMessage(error)} />}
              {data && (
                <Data
                  authToken={authToken}
                  organizations={data}
                  isMissingAccessToRequestedOrg={isMissingAccessToRequestedOrg}
                />
              )}
            </>
          ) : (
            <ErrorComponent message={t('errors.no-auth-token')} />
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
