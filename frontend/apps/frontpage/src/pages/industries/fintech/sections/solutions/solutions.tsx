import { Container, Stack, Text, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SolutionsViewer from '../../../components/solutions-viewer';

const keys = [
  {
    key: 'fintech.solution.dynamically-satisfy-cip',
    imgPath: '/industries/fintech/dynamically-satisfy-cip',
    frontImgSize: { width: 720, height: 998 },
    frontImgPosition: { top: '110%', left: '50%' },
  },
  {
    key: 'fintech.solution.case-management',
    imgPath: '/industries/fintech/case-management',
    frontImgSize: { width: 442, height: 420 },
    frontImgPosition: { top: '50%', left: '50%' },
  },
  {
    key: 'fintech.solution.data-vault',
    imgPath: '/industries/fintech/data-vault',
    frontImgSize: { width: 500, height: 540 },
    frontImgPosition: { top: '65%', left: '50%' },
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
