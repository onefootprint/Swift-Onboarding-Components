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
              <>
                {/* Pass same condition to border to avoid flash-appear in edge case */}
                <Border data-visible={data?.length === 0} />
                <Wave
                  initial={{
                    opacity: 0.2,
                    width: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 0,
                    width: 140,
                    height: 140,
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
                <Wave
                  initial={{
                    opacity: 0.2,
                    width: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 0,
                    width: 140,
                    height: 140,
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: 3,
                  }}
                />
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

const Wave = styled(motion.span)`
  ${({ theme }) => css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: ${theme.borderRadius.full};
    background: ${theme.color.accent};
    z-index: -1;
    pointer-events: none;
    user-select: none;
  `}
`;

const Border = styled.div`
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
    pointer-events: none;
    isolation: isolate;
    overflow: hidden;

    &[data-visible='true'] {
      border-color: ${theme.color.accent};
    }

    &[data-visible='false'] {
      border-color: ${theme.borderColor.transparent};
    }
  `}
`;

export default OnboardingConfigs;
