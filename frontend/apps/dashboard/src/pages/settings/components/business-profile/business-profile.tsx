import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { Box, Divider, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Data from './components/data';
import Error from './components/error';
import Loading from './components/loading';
import useOrg from './hooks/use-org';

const BusinessProfile = () => {
  const { t } = useTranslation('pages.settings.business-profile');
  const { isLoading, error, data } = useOrg();

  return (
    <section data-testid="business-profile-section">
      <Header>
        <Box>
          <Typography variant="label-1" as="h3" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography variant="body-3">{t('header.subtitle')}</Typography>
        </Box>
      </Header>
      <Box sx={{ marginY: 5 }}>
        <StyledDivider />
      </Box>
      <Container aria-busy={isLoading} aria-live="polite">
        <>
          {isLoading && <Loading />}
          {error && <Error message={getErrorMessage(error)} />}
          {data && <Data organization={data} />}
        </>
      </Container>
    </section>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[2]};
    justify-content: space-between;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    flex-direction: column;
    gap: ${theme.spacing[8]};
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[8]};
  `}
`;

export default BusinessProfile;
