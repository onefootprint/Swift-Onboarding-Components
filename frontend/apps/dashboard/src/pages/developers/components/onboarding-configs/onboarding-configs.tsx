import { useTranslation } from '@onefootprint/hooks';
import { Box } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Head from 'next/head';
import React from 'react';
import SectionHeader from 'src/components/section-header';
import styled, { css } from 'styled-components';

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
              <Wave
                initial={{
                  opacity: 0.1,
                  width: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 0,
                  width: 120,
                  height: 120,
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' }}
              />
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

const Wave = styled(motion.span)`
  ${({ theme }) => css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: ${theme.borderRadius.full};
    background: ${theme.color.accent};
    z-index: -1;
  `}
`;

export default OnboardingConfigs;
