import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
  InvestorProfileInvestmentGoal,
} from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button';
import { InvestmentGoalsData } from '../../../../utils/state-machine/types';

type FormData = Record<InvestorProfileInvestmentGoal, boolean>;

export type InvestmentGoalsFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    InvestorProfileDataAttribute.investmentGoals
  >;
  isLoading?: boolean;
  onSubmit: (data: InvestmentGoalsData) => void;
};

const InvestmentGoalsForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: InvestmentGoalsFormProps) => {
  const { t } = useTranslation('pages.investment-goals.form');
  const defaultEntries = (
    defaultValues?.[InvestorProfileDataAttribute.investmentGoals] ?? []
  ).map(goal => [goal, true]);
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: Object.fromEntries(defaultEntries),
  });

  const handleBeforeSubmit = (data: FormData) => {
    const goals = Object.entries(data)
      .filter(([, value]) => !!value)
      .map(([key]) => key as InvestorProfileInvestmentGoal);
    onSubmit({
      [InvestorProfileDataAttribute.investmentGoals]: goals,
    });
  };

  return (
    <Form onSubmit={handleSubmit(handleBeforeSubmit)}>
      <CheckboxContainer>
        <Checkbox
          label={t(InvestorProfileInvestmentGoal.growLongTermWealth)}
          {...register(InvestorProfileInvestmentGoal.growLongTermWealth)}
        />
        <Checkbox
          label={t(InvestorProfileInvestmentGoal.saveForRetirement)}
          {...register(InvestorProfileInvestmentGoal.saveForRetirement)}
        />
        <Checkbox
          label={t(InvestorProfileInvestmentGoal.buyAHome)}
          {...register(InvestorProfileInvestmentGoal.buyAHome)}
        />
        <Checkbox
          label={t(InvestorProfileInvestmentGoal.payOffDebt)}
          {...register(InvestorProfileInvestmentGoal.payOffDebt)}
        />
        <Checkbox
          label={t(InvestorProfileInvestmentGoal.startMyOwnBusiness)}
          {...register(InvestorProfileInvestmentGoal.startMyOwnBusiness)}
        />
      </CheckboxContainer>
      <ContinueButton isLoading={isLoading} />
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

const CheckboxContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default InvestmentGoalsForm;
