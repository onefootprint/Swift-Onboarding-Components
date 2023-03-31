import { useTranslation } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import React from 'react';
import { Field } from 'src/components';

type NameProps = {
  onboardingConfig: OnboardingConfig;
};

const Name = ({ onboardingConfig }: NameProps) => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.details.name',
  );

  return <Field label={t('label')}>{onboardingConfig.name}</Field>;
};

export default Name;
