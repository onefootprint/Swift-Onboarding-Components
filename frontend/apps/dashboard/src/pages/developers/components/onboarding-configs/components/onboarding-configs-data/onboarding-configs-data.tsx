import { useTranslation } from 'hooks';
import React from 'react';
import type { OnboardingConfig } from 'src/types/onboarding-config';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

import OnboardingConfigItem from './components/onboarding-config-item';

type OnboardingConfigsDataProps = {
  data: OnboardingConfig[];
};

const OnboardingConfigsData = ({ data }: OnboardingConfigsDataProps) => {
  const { t } = useTranslation('pages.developers.onboarding-configs.list');

  return data.length === 0 ? (
    <Typography color="secondary" variant="body-2">
      {t('no-results')}
    </Typography>
  ) : (
    <List>
      {data.map(onboardingConfig => (
        <OnboardingConfigItem
          key={onboardingConfig.id}
          data={onboardingConfig}
        />
      ))}
    </List>
  );
};

const List = styled.div`
  ${({ theme }) => css`
    table {
      margin-bottom: ${theme.spacing[7]}px;
    }
  `}
`;

export default OnboardingConfigsData;
