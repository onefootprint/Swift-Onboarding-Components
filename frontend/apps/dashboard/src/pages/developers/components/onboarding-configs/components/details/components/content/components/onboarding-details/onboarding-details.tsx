import { useTranslation } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { CodeInline } from '@onefootprint/ui';
import React from 'react';
import { Field } from 'src/components';

import isKybOnboardingConfig from '../../../../../../utils/is-kyb-onboarding-config';

type OnboardingDetailsProps = {
  onboardingConfig: OnboardingConfig;
};

const OnboardingDetails = ({ onboardingConfig }: OnboardingDetailsProps) => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs-new.details.onboarding-details',
  );
  const isKyb = isKybOnboardingConfig(onboardingConfig);

  return (
    <>
      <Field label={t('type.label')}>
        {isKyb ? t('type.kyb') : t('type.kyc')}
      </Field>
      <Field label={t('key')}>
        <CodeInline truncate>{onboardingConfig.key}</CodeInline>
      </Field>
    </>
  );
};

export default OnboardingDetails;
