import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileAnnualIncome,
  InvestorProfileData,
  InvestorProfileDI,
} from '@onefootprint/types';
import { Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import FormWithOptions from '../../../../components/custom-form';
import { IncomeData } from '../../../../utils/state-machine/types';

export type IncomeFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.annualIncome>;
  isLoading?: boolean;
  onSubmit: (data: IncomeData) => void;
};

type FormData = {
  income: InvestorProfileAnnualIncome;
};

const IncomeForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: IncomeFormProps) => {
  const { t } = useTranslation('pages.income');
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      income:
        defaultValues?.[InvestorProfileDI.annualIncome] ??
        InvestorProfileAnnualIncome.lt50k,
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
        value={InvestorProfileAnnualIncome.lt50k}
        label={t(`${InvestorProfileAnnualIncome.lt50k}`)}
        {...register('income')}
      />
      <Radio
        value={InvestorProfileAnnualIncome.s50kTo100k}
        label={t(`${InvestorProfileAnnualIncome.s50kTo100k}`)}
        {...register('income')}
      />
      <Radio
        value={InvestorProfileAnnualIncome.s100kTo250k}
        label={t(`${InvestorProfileAnnualIncome.s100kTo250k}`)}
        {...register('income')}
      />
      <Radio
        value={InvestorProfileAnnualIncome.s250kTo500k}
        label={t(`${InvestorProfileAnnualIncome.s250kTo500k}`)}
        {...register('income')}
      />
      <Radio
        value={InvestorProfileAnnualIncome.gt500k}
        label={t(`${InvestorProfileAnnualIncome.gt500k}`)}
        {...register('income')}
      />
    </FormWithOptions>
  );
};

export default IncomeForm;
