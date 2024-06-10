import { Container, Stack, Text, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SolutionsViewer from '../../../components/solutions-viewer';

const keys = [
  {
    key: 'baas.solution.dynamic-rules-engine-with-step-ups',
    imgPath: '/industries/baas/dynamic-rules-engine-with-step-ups',
    frontImgSize: { width: 719, height: 1000 },
    frontImgPosition: { top: '110%', left: '50%' },
  },
  {
    key: 'baas.solution.unified-kyc-aml-monitoring',
    imgPath: '/industries/baas/unified-kyc-aml-monitoring',
    frontImgSize: { width: 600, height: 281 },
    frontImgPosition: { top: '50%', left: '50%' },
  },
  {
    key: 'baas.solution.built-in-compliance-dashboard',
    imgPath: '/industries/baas/built-in-compliance-dashboard',
    frontImgSize: { width: 500, height: 500 },
    frontImgPosition: { top: '50%', left: '50%' },
  },
];

const Solutions = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.auto.solution',
  });
  return (
    <Background>
      <SectionContainer>
        <Stack>
          <Text variant="display-3" tag="h2">
            {t('title')}
          </Text>
        </Stack>
        <SolutionsViewer keys={keys} />
      </SectionContainer>
    </Background>
  );
};

const SectionContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[9]};
    padding-bottom: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      padding-top: ${theme.spacing[12]};
      padding-bottom: ${theme.spacing[12]};
    `}
  `}
`;

const Background = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
  `}
`;

export default Solutions;
