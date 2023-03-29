import { useIntl, useTranslation } from '@onefootprint/hooks';
import {
  CollectedDataOption,
  CollectedKybDataOption,
  OnboardingConfig,
} from '@onefootprint/types';
import { Badge, CodeInline } from '@onefootprint/ui';
import React from 'react';

import Actions from './components/actions';

export type RowProps = {
  onboardingConfig: OnboardingConfig;
};

const isKybCdo = (data: CollectedDataOption) =>
  Object.values(CollectedKybDataOption).includes(
    data as CollectedKybDataOption,
  );

const Row = ({ onboardingConfig }: RowProps) => {
  const { t } = useTranslation('pages.developers.onboarding-configs-new');
  const { formatDateWithTime } = useIntl();
  const { name, key, status, createdAt, mustCollectData } = onboardingConfig;
  const isKyb = mustCollectData.some(data => isKybCdo(data));

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
