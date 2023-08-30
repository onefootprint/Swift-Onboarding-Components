import { useTranslation } from '@onefootprint/hooks';
import { UsLegalStatus } from '@onefootprint/types';
import { Radio } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

type StatusFieldsProps = {
  handleStatusChange: () => void;
};

const StatusFields = ({ handleStatusChange }: StatusFieldsProps) => {
  const { t } = useTranslation('pages.legal-status.statuses');

  const { register } = useFormContext();

  return (
    <>
      <Radio
        value={UsLegalStatus.citizen}
        label={t('citizen')}
        {...register('usLegalStatus', { onChange: handleStatusChange })}
        testID="citizen-radio"
      />
      <Radio
        value={UsLegalStatus.permanentResident}
        label={t('permanent-resident')}
        {...register('usLegalStatus', { onChange: handleStatusChange })}
        testID="permanent-resident-radio"
      />
      <Radio
        value={UsLegalStatus.visa}
        label={t('visa')}
        {...register('usLegalStatus', { onChange: handleStatusChange })}
        testID="visa-radio"
      />
    </>
  );
};

export default StatusFields;
