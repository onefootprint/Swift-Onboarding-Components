import { Box, Container, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ProblemSolutionCard from 'src/pages/industries/components/problem-solution-card';
import type { CustomIcons } from 'src/pages/industries/components/problem-solution-card/problem-solution-card';
import styled, { css } from 'styled-components';

const keys: { key: string; icon: CustomIcons }[] = [
  {
    key: 'raising-fraud',
    icon: 'confidence',
  },
  {
    key: 'inadequate-screening',
    icon: 'users',
  },
  {
    key: 'fraud-detection',
    icon: 'confidence-alt',
  },
];

const Problems = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.auto.problem',
  });

  return (
    <Background>
      <SectionContainer>
        <Stack>
          <Text variant="display-3" tag="h2">
            {t('title')}
          </Text>
        </Stack>
        <CardsContainer>
          {keys.map(({ key, icon }) => (
            <ProblemSolutionCard
              key={key}
              title={t(`${key}.title` as unknown as ParseKeys<'common'>)}
              subtitle={t(`${key}.subtitle` as unknown as ParseKeys<'common'>)}
              icon={icon}
            />
          ))}
        </CardsContainer>
      </SectionContainer>
    </Background>
  );
};

const Background = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
  `}
`;

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

const CardsContainer = styled(Box)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-template-rows: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${theme.spacing[3]};
  `}
`;

export default Problems;
