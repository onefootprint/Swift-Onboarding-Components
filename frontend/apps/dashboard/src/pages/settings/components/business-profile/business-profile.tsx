import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { Box, Divider } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SectionHeader from '../section-header';
import Data from './components/data';
import Error from './components/error';
import Loading from './components/loading';
import useOrg from './hooks/use-org';

const BusinessProfile = () => {
  const { t } = useTranslation('pages.settings.business-profile');
  const { isLoading, error, data } = useOrg();

  return (
    <section data-testid="business-profile-section">
      <SectionHeader
        title={t('header.title')}
        subtitle={t('header.subtitle')}
      />
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
