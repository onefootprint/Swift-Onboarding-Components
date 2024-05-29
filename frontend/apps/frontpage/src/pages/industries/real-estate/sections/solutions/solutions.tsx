import { Container, media, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SolutionsViewer from '../../../components/solutions-viewer';

const keys = [
  {
    key: 'real-estate.solution.exposed-risk-signals',
    imgPath: '/industries/real-estate/exposed-risk-signals',
    frontImgSize: { width: 650, height: 450 },
  },
  {
    key: 'real-estate.solution.case-management',
    imgPath: '/industries/real-estate/case-management',
    frontImgSize: { width: 650, height: 450 },
  },
  {
    key: 'real-estate.solution.extra-doc-collection',
    imgPath: '/industries/real-estate/extra-doc-collection',
    frontImgSize: { width: 400, height: 650 },
  },
];

const Solutions = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.real-estate.solution',
  });
  return (
    <Background>
      <SectionContainer>
        <Text variant="display-3" tag="h2">
          {t('title')}
        </Text>
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
