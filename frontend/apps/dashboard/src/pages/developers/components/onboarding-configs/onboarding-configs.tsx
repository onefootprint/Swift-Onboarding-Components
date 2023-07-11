import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import SectionHeader from 'src/components/section-header';
import WaveAnimation from 'src/components/wave-animation';

// import Create from './components/create-new';
import Create from './components/create';
import Details from './components/details';
import Table from './components/table';
import useOnboardingConfigs from './hooks/use-onboarding-configs';

const OnboardingConfigs = () => {
  const { t } = useTranslation('pages.developers.onboarding-configs');
  const { data, errorMessage, isLoading, refetch } = useOnboardingConfigs();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box testID="onboarding-configs-section" as="section">
        <SectionHeader title={t('title')} subtitle={t('subtitle')}>
          <Wrapper>
            <Create onCreate={refetch} />
            {data?.length === 0 && (
              <>
                <Divider />
                <WaveAnimation width={140} />
              </>
            )}
          </Wrapper>
        </SectionHeader>
        <Box sx={{ marginY: 5 }} />
        <Table data={data} errorMessage={errorMessage} isLoading={isLoading} />
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
