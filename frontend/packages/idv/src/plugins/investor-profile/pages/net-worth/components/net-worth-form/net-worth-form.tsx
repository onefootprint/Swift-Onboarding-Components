import type { InvestorProfileData } from '@onefootprint/types';
import { InvestorProfileDI, InvestorProfileNetWorth } from '@onefootprint/types';
import { Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormWithErrorAndFooter from '../../../../components/form-with-error-footer';
import type { NetWorthData } from '../../../../utils/state-machine/types';

export type NetWorthFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.netWorth>;
  footer: React.ReactNode;
  onSubmit: (data: NetWorthData) => void;
};

type FormData = { netWorth: InvestorProfileNetWorth };

const { le50k, gt50kLe100k, gt100kLe200k, gt200kLe500k, gt500kLe1m, gt1mLe5m, gt5m } = InvestorProfileNetWorth;

const NetWorthForm = ({ defaultValues, footer, onSubmit }: NetWorthFormProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.pages.net-worth' });
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: { netWorth: defaultValues?.[InvestorProfileDI.netWorth] ?? le50k },
  });

  const handleBeforeSubmit = (data: FormData) => {
    const { netWorth } = data;
    onSubmit({ [InvestorProfileDI.netWorth]: netWorth });
  };

  return (
    <FormWithErrorAndFooter formAttributes={{ onSubmit: handleSubmit(handleBeforeSubmit) }} footer={footer}>
      <Radio value={le50k} label={t(`${le50k}`)} {...register('netWorth')} />
      <Radio value={gt50kLe100k} label={t(`${gt50kLe100k}`)} {...register('netWorth')} />
      <Radio value={gt100kLe200k} label={t(`${gt100kLe200k}`)} {...register('netWorth')} />
      <Radio value={gt200kLe500k} label={t(`${gt200kLe500k}`)} {...register('netWorth')} />
      <Radio value={gt500kLe1m} label={t(`${gt500kLe1m}`)} {...register('netWorth')} />
      <Radio value={gt1mLe5m} label={t(`${gt1mLe5m}`)} {...register('netWorth')} />
      <Radio value={gt5m} label={t(`${gt5m}`)} {...register('netWorth')} />
    </FormWithErrorAndFooter>
  );
};

export default NetWorthForm;
