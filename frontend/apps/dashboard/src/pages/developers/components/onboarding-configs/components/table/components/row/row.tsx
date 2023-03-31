import { useIntl, useTranslation } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { Badge, CodeInline } from '@onefootprint/ui';
import React from 'react';

import isKybOnboardingConfig from '../../../../utils/is-kyb-onboarding-config';
import Actions from './components/actions';

export type RowProps = {
  onboardingConfig: OnboardingConfig;
};

const Row = ({ onboardingConfig }: RowProps) => {
  const { t } = useTranslation('pages.developers.onboarding-configs');
  const { formatDateWithTime } = useIntl();
  const { name, key, status, createdAt } = onboardingConfig;
  const isKyb = isKybOnboardingConfig(onboardingConfig);

  return (
    <>
      <td>{name}</td>
      <td>{isKyb ? t('type.kyb') : t('type.kyc')}</td>
      <td>
        <CodeInline truncate>{key}</CodeInline>
      </td>
      <td>
        {status === 'enabled' && (
          <Badge variant="success">{t('status.enabled')}</Badge>
        )}
        {status === 'disabled' && (
          <Badge variant="error">{t('status.disabled')}</Badge>
        )}
      </td>
      <td>{formatDateWithTime(new Date(createdAt))}</td>
      <td>
        <Actions onboardingConfig={onboardingConfig} />
      </td>
    </>
  );
};

export default Row;
