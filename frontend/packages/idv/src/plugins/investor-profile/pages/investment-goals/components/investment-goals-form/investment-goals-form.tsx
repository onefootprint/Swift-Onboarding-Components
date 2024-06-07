import type { InvestorProfileData } from '@onefootprint/types';
import { InvestorProfileDI, InvestorProfileInvestmentGoal } from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CustomForm from '../../../../components/custom-form';
import type { InvestmentGoalsData } from '../../../../utils/state-machine/types';

export type InvestmentGoalsFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.investmentGoals>;
  isLoading?: boolean;
  onSubmit: (data: InvestmentGoalsData) => void;
};

type FormData = Record<InvestorProfileInvestmentGoal, boolean>;

const InvestmentGoalsForm = ({ defaultValues, isLoading, onSubmit }: InvestmentGoalsFormProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'investor-profile.pages.investment-goals',
  });
  const defaultEntries = (defaultValues?.[InvestorProfileDI.investmentGoals] ?? []).map(goal => [goal, true]);

  const { handleSubmit, register, watch } = useForm<FormData>({
    defaultValues: Object.fromEntries(defaultEntries),
  });
  const [showError, setShowError] = useState(false);
  const growth = watch(InvestorProfileInvestmentGoal.growth);
  const income = watch(InvestorProfileInvestmentGoal.income);
  const preserve = watch(InvestorProfileInvestmentGoal.preserveCapital);
  const speculation = watch(InvestorProfileInvestmentGoal.speculation);
  const diversification = watch(InvestorProfileInvestmentGoal.diversification);
  const other = watch(InvestorProfileInvestmentGoal.other);
  const hasEmptySelection = !growth && !income && !diversification && !preserve && !speculation && !other;

  const handleBeforeSubmit = (data: FormData) => {
    if (hasEmptySelection) {
      setShowError(true);
      return;
    }

    const goals = Object.entries(data)
      .filter(([, value]) => !!value)
      .map(([key]) => key as InvestorProfileInvestmentGoal);

    onSubmit({
      [InvestorProfileDI.investmentGoals]: goals,
    });
  };

  return (
    <CustomForm
      title={t('title')}
      subtitle={t('subtitle')}
      isLoading={isLoading}
      formAttributes={{ onSubmit: handleSubmit(handleBeforeSubmit) }}
      error={hasEmptySelection && showError ? t('empty-selection') : undefined}
    >
      <Checkbox label={t(InvestorProfileInvestmentGoal.growth)} {...register(InvestorProfileInvestmentGoal.growth)} />
      <Checkbox label={t(InvestorProfileInvestmentGoal.income)} {...register(InvestorProfileInvestmentGoal.income)} />
      <Checkbox
        label={t(InvestorProfileInvestmentGoal.preserveCapital)}
        {...register(InvestorProfileInvestmentGoal.preserveCapital)}
      />
      <Checkbox
        label={t(InvestorProfileInvestmentGoal.speculation)}
        {...register(InvestorProfileInvestmentGoal.speculation)}
      />
      <Checkbox
        label={t(InvestorProfileInvestmentGoal.diversification)}
        {...register(InvestorProfileInvestmentGoal.diversification)}
      />
      <Checkbox label={t(InvestorProfileInvestmentGoal.other)} {...register(InvestorProfileInvestmentGoal.other)} />
    </CustomForm>
  );
};

export default InvestmentGoalsForm;
