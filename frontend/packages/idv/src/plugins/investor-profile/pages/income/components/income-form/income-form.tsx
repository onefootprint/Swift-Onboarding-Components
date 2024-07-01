import type { InvestorProfileData } from '@onefootprint/types';
import { InvestorProfileAnnualIncome, InvestorProfileDI } from '@onefootprint/types';
import { Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormWithErrorAndFooter from '../../../../components/form-with-error-footer';
import type { IncomeData } from '../../../../utils/state-machine/types';

type FormData = { income: InvestorProfileAnnualIncome };

export type IncomeFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.annualIncome>;
  footer: React.ReactNode;
  onSubmit: (data: IncomeData) => void;
};

const { le25k, gt25kLe50k, gt50kLe100k, gt100kLe200k, gt200kLe300k, gt300kLe500k, gt500kLe1200k, gt1200k } =
  InvestorProfileAnnualIncome;

const IncomeForm = ({ defaultValues, footer, onSubmit }: IncomeFormProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.pages.income' });
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: { income: defaultValues?.[InvestorProfileDI.annualIncome] ?? le25k },
  });

  const handleBeforeSubmit = (data: FormData) => {
    const { income } = data;
    onSubmit({ [InvestorProfileDI.annualIncome]: income });
  };

  return (
    <FormWithErrorAndFooter formAttributes={{ onSubmit: handleSubmit(handleBeforeSubmit) }} footer={footer}>
      <Radio value={le25k} label={t(`${le25k}`)} {...register('income')} />
      <Radio value={gt25kLe50k} label={t(`${gt25kLe50k}`)} {...register('income')} />
      <Radio value={gt50kLe100k} label={t(`${gt50kLe100k}`)} {...register('income')} />
      <Radio value={gt100kLe200k} label={t(`${gt100kLe200k}`)} {...register('income')} />
      <Radio value={gt200kLe300k} label={t(`${gt200kLe300k}`)} {...register('income')} />
      <Radio value={gt300kLe500k} label={t(`${gt300kLe500k}`)} {...register('income')} />
      <Radio value={gt500kLe1200k} label={t(`${gt500kLe1200k}`)} {...register('income')} />
      <Radio value={gt1200k} label={t(`${gt1200k}`)} {...register('income')} />
    </FormWithErrorAndFooter>
  );
};

export default IncomeForm;
