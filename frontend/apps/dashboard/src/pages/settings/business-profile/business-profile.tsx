import { getOrgOptions } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import { Box, Divider, Text } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import SectionHeader from 'src/components/section-header';
import styled, { css } from 'styled-components';

import Content from './components/content';
import ErrorDisplay from './components/error-display';
import Loading from './components/loading';

const BusinessProfile = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.business-profile',
  });
  const { isPending, data, error } = useQuery(getOrgOptions());

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <section>
        <Header>
          <Text variant="heading-2" tag="h2">
            {t('meta-title')}
          </Text>
        </Header>
        <SectionHeader title={t('header.title')} subtitle={t('header.subtitle')} />
        <Box marginBottom={5}>
          <StyledDivider />
        </Box>
        <Container aria-busy={isPending} aria-live="polite">
          <>
            {error && <ErrorDisplay message={getErrorMessage(error)} />}
            {isPending && <Loading />}
            {data && <Content organization={data} />}
          </>
        </Container>
      </section>
    </>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[7]};
  `};
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
