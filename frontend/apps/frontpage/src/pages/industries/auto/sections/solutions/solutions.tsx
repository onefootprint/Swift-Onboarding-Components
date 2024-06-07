import { Container, Stack, Text, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SolutionsViewer from '../../../components/solutions-viewer';

const keys = [
  {
    key: 'auto.solution.unified-risk-engine',
    imgPath: '/industries/auto/unified-risk-engine',
    frontImgSize: { width: 814, height: 626 },
    frontImgPosition: { top: '65%', left: '50%' },
  },
  {
    key: 'auto.solution.online-in-person',
    imgPath: '/industries/auto/online-in-person',
    frontImgSize: { width: 396, height: 364 },
    frontImgPosition: { top: '50%', left: '50%' },
  },
  {
    key: 'auto.solution.automate-extra-document-collection',
    imgPath: '/industries/auto/automate-extra-document-collection',
    frontImgSize: { width: 390, height: 650 },
    frontImgPosition: { top: '75%', left: '50%' },
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
