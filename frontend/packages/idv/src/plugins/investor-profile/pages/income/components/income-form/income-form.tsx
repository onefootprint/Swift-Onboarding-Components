import type { InvestorProfileData } from '@onefootprint/types';
import { InvestorProfileAnnualIncome, InvestorProfileDI } from '@onefootprint/types';
import { Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormWithOptions from '../../../../components/custom-form';
import type { IncomeData } from '../../../../utils/state-machine/types';

export type IncomeFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.annualIncome>;
  isLoading?: boolean;
  onSubmit: (data: IncomeData) => void;
};

type FormData = {
  income: InvestorProfileAnnualIncome;
};

const IncomeForm = ({ defaultValues, isLoading, onSubmit }: IncomeFormProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'investor-profile.pages.income',
  });
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      income: defaultValues?.[InvestorProfileDI.annualIncome] ?? InvestorProfileAnnualIncome.le25k,
    },
  });

  const handleBeforeSubmit = (data: FormData) => {
    const { income } = data;
    onSubmit({
      [InvestorProfileDI.annualIncome]: income,
    });
  };

  return (
    <FormWithOptions
      title={t('title')}
      subtitle={t('subtitle')}
      isLoading={isLoading}
      formAttributes={{
        onSubmit: handleSubmit(handleBeforeSubmit),
      }}
    >
      <Radio
        value={InvestorProfileAnnualIncome.le25k}
        label={t(`${InvestorProfileAnnualIncome.le25k}`)}
        {...register('income')}
      />
      <Radio
        value={InvestorProfileAnnualIncome.gt25kLe50k}
        label={t(`${InvestorProfileAnnualIncome.gt25kLe50k}`)}
        {...register('income')}
      />
      <Radio
        value={InvestorProfileAnnualIncome.gt50kLe100k}
        label={t(`${InvestorProfileAnnualIncome.gt50kLe100k}`)}
        {...register('income')}
      />
      <Radio
        value={InvestorProfileAnnualIncome.gt100kLe200k}
        label={t(`${InvestorProfileAnnualIncome.gt100kLe200k}`)}
        {...register('income')}
      />
      <Radio
        value={InvestorProfileAnnualIncome.gt200kLe300k}
        label={t(`${InvestorProfileAnnualIncome.gt200kLe300k}`)}
        {...register('income')}
      />
      <Radio
        value={InvestorProfileAnnualIncome.gt300kLe500k}
        label={t(`${InvestorProfileAnnualIncome.gt300kLe500k}`)}
        {...register('income')}
      />
      <Radio
        value={InvestorProfileAnnualIncome.gt500kLe1200k}
        label={t(`${InvestorProfileAnnualIncome.gt500kLe1200k}`)}
        {...register('income')}
      />
      <Radio
        value={InvestorProfileAnnualIncome.gt1200k}
        label={t(`${InvestorProfileAnnualIncome.gt1200k}`)}
        {...register('income')}
      />
    </FormWithOptions>
  );
};

export default IncomeForm;
