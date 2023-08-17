import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, Pagination } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import SectionHeader from 'src/components/section-header';
import WaveAnimation from 'src/components/wave-animation';

import Create from './components/create';
import Details from './components/details';
import Table from './components/table';
import useOnboardingConfigs from './hooks/use-onboarding-configs';

const OnboardingConfigs = () => {
  const [hasHadObConfig, setHasHadObConfig] = useState(false);
  const { t } = useTranslation('pages.developers.onboarding-configs');
  const {
    data: response,
    errorMessage,
    isLoading,
    pagination,
  } = useOnboardingConfigs();

  useEffect(() => {
    if (response && response?.data?.length > 0) {
      setHasHadObConfig(true);
    }
  }, [response]);

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box testID="onboarding-configs-section" as="section">
        <SectionHeader title={t('title')} subtitle={t('subtitle')}>
          <Wrapper>
            <Create />
            {!hasHadObConfig && (
              <>
                <Divider />
                <WaveAnimation width={140} />
              </>
            )}
          </Wrapper>
        </SectionHeader>
        <Box sx={{ marginY: 5 }} />
        <Table
          data={response?.data}
          errorMessage={errorMessage}
          isLoading={isLoading}
        />
        {response && response.meta.count > 0 && (
          <Pagination
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onNextPage={pagination.loadNextPage}
            onPrevPage={pagination.loadPrevPage}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            totalNumResults={response.meta.count}
          />
        )}
        <Details />
      </Box>
    </>
  );
};

const Wrapper = styled.div`
  position: relative;
`;

const Divider = styled.div`
  ${({ theme }) => css`
    position: absolute;
    box-sizing: border-box;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-width: ${theme.borderWidth[1]};
    border-style: solid;
    border-radius: ${theme.borderRadius.default};
    border-color: ${theme.color.accent};
    pointer-events: none;
    isolation: isolate;
    overflow: hidden;
  `}
`;

export default OnboardingConfigs;
