import type { InvestorProfileData } from '@onefootprint/types';
import { InvestorProfileDI, InvestorProfileNetWorth } from '@onefootprint/types';
import { Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CustomForm from '../../../../components/custom-form';
import type { NetWorthData } from '../../../../utils/state-machine/types';

export type NetWorthFormProps = {
  isLoading?: boolean;
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.netWorth>;
  onSubmit: (data: NetWorthData) => void;
};

type FormData = {
  netWorth: InvestorProfileNetWorth;
};

const NetWorthForm = ({ isLoading, defaultValues, onSubmit }: NetWorthFormProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'investor-profile.pages.net-worth',
  });
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      netWorth: defaultValues?.[InvestorProfileDI.netWorth] ?? InvestorProfileNetWorth.le50k,
    },
  });

  const handleBeforeSubmit = (data: FormData) => {
    const { netWorth } = data;
    onSubmit({
      [InvestorProfileDI.netWorth]: netWorth,
    });
  };

  return (
    <CustomForm
      title={t('title')}
      subtitle={t('subtitle')}
      formAttributes={{
        onSubmit: handleSubmit(handleBeforeSubmit),
      }}
      isLoading={isLoading}
    >
      <Radio
        value={InvestorProfileNetWorth.le50k}
        label={t(`${InvestorProfileNetWorth.le50k}`)}
        {...register('netWorth')}
      />
      <Radio
        value={InvestorProfileNetWorth.gt50kLe100k}
        label={t(`${InvestorProfileNetWorth.gt50kLe100k}`)}
        {...register('netWorth')}
      />
      <Radio
        value={InvestorProfileNetWorth.gt100kLe200k}
        label={t(`${InvestorProfileNetWorth.gt100kLe200k}`)}
        {...register('netWorth')}
      />
      <Radio
        value={InvestorProfileNetWorth.gt200kLe500k}
        label={t(`${InvestorProfileNetWorth.gt200kLe500k}`)}
        {...register('netWorth')}
      />
      <Radio
        value={InvestorProfileNetWorth.gt500kLe1m}
        label={t(`${InvestorProfileNetWorth.gt500kLe1m}`)}
        {...register('netWorth')}
      />
      <Radio
        value={InvestorProfileNetWorth.gt1mLe5m}
        label={t(`${InvestorProfileNetWorth.gt1mLe5m}`)}
        {...register('netWorth')}
      />
      <Radio
        value={InvestorProfileNetWorth.gt5m}
        label={t(`${InvestorProfileNetWorth.gt5m}`)}
        {...register('netWorth')}
      />
    </CustomForm>
  );
};

export default NetWorthForm;
