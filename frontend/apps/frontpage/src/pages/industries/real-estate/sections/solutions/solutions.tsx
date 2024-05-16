import { Container, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SolutionsViewer from './components/solutions-viewer';

const Solutions = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.real-estate.solution',
  });
  return (
    <Background>
      <SectionContainer>
        <Stack>
          <Text variant="display-3">{t('title')}</Text>
        </Stack>
        <SolutionsViewer />
      </SectionContainer>
    </Background>
  );
};

const SectionContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: ${theme.spacing[12]};
    padding-bottom: ${theme.spacing[12]};
    gap: ${theme.spacing[9]};
  `}
`;

const Background = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
  `}
`;

export default Solutions;
