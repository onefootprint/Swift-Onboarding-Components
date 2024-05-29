import { Box, Container, media, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ProblemSolutionCard from 'src/pages/industries/components/problem-solution-card';
import type { CustomIcons } from 'src/pages/industries/components/problem-solution-card/problem-solution-card';
import styled, { css } from 'styled-components';

const keys: { key: string; icon: CustomIcons }[] = [
  {
    key: 'accuracy',
    icon: 'chip',
  },
  {
    key: 'attempts',
    icon: 'app-clip',
  },
  {
    key: 'flagged',
    icon: 'ID',
  },
];

const Experience = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.real-estate.experience',
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

const CardsContainer = styled(Box)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-template-rows: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${theme.spacing[3]};
  `}
`;

const SectionContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[9]};
    padding: ${theme.spacing[9]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[12]} 0;
    `}
  `}
`;

export default Experience;
