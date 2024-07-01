import type { InvestorProfileData } from '@onefootprint/types';
import { InvestorProfileDI, InvestorProfileInvestmentGoal } from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormWithErrorAndFooter from '../../../../components/form-with-error-footer';
import type { InvestmentGoalsData } from '../../../../utils/state-machine/types';

export type InvestmentGoalsFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.investmentGoals>;
  footer: React.ReactNode;
  onSubmit: (data: InvestmentGoalsData) => void;
};

type FormData = Record<InvestorProfileInvestmentGoal, boolean>;

const { growth, income, preserveCapital, speculation, diversification, other } = InvestorProfileInvestmentGoal;

const InvestmentGoalsForm = ({ defaultValues, footer, onSubmit }: InvestmentGoalsFormProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.pages.investment-goals' });
  const defaultEntries = (defaultValues?.[InvestorProfileDI.investmentGoals] ?? []).map(goal => [goal, true]);

  const { handleSubmit, register, watch } = useForm<FormData>({ defaultValues: Object.fromEntries(defaultEntries) });
  const [showError, setShowError] = useState(false);
  const hasEmptySelection =
    !watch(growth) &&
    !watch(income) &&
    !watch(diversification) &&
    !watch(preserveCapital) &&
    !watch(speculation) &&
    !watch(other);

  const handleBeforeSubmit = (data: FormData) => {
    if (hasEmptySelection) {
      setShowError(true);
      return;
    }

    const goals = Object.entries(data)
      .filter(([, value]) => !!value)
      .map(([key]) => key as InvestorProfileInvestmentGoal);

    onSubmit({ [InvestorProfileDI.investmentGoals]: goals });
  };

  return (
    <FormWithErrorAndFooter
      error={hasEmptySelection && showError ? t('empty-selection') : undefined}
      footer={footer}
      formAttributes={{ onSubmit: handleSubmit(handleBeforeSubmit) }}
    >
      <Checkbox label={t(growth)} {...register(growth)} />
      <Checkbox label={t(income)} {...register(income)} />
      <Checkbox label={t(preserveCapital)} {...register(preserveCapital)} />
      <Checkbox label={t(speculation)} {...register(speculation)} />
      <Checkbox label={t(diversification)} {...register(diversification)} />
      <Checkbox label={t(other)} {...register(other)} />
    </FormWithErrorAndFooter>
  );
};

export default InvestmentGoalsForm;
