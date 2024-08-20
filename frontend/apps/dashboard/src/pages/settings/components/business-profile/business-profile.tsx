import { getErrorMessage } from '@onefootprint/request';
import { Box, Divider } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import SectionHeader from 'src/components/section-header';
import useOrg from 'src/hooks/use-org';
import styled, { css } from 'styled-components';

import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';

const BusinessProfile = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.business-profile',
  });
  const { isLoading, error, data } = useOrg();

  return (
    <section>
      <SectionHeader title={t('header.title')} subtitle={t('header.subtitle')} />
      <Box marginBottom={5}>
        <StyledDivider />
      </Box>
      <Container aria-busy={isLoading} aria-live="polite">
        <>
          {isLoading && <Loading />}
          {error && <ErrorComponent message={getErrorMessage(error)} />}
          {data && <Content organization={data} />}
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
