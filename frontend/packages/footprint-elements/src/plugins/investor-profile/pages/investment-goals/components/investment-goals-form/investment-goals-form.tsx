import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileData,
  InvestorProfileDI,
  InvestorProfileInvestmentGoal,
} from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button';
import { InvestmentGoalsData } from '../../../../utils/state-machine/types';
import Error from '../error';

export type InvestmentGoalsFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.investmentGoals>;
  isLoading?: boolean;
  onSubmit: (data: InvestmentGoalsData) => void;
};

type FormData = Record<InvestorProfileInvestmentGoal, boolean>;

const InvestmentGoalsForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: InvestmentGoalsFormProps) => {
  const { t } = useTranslation('pages.investment-goals.form');
  const defaultEntries = (
    defaultValues?.[InvestorProfileDI.investmentGoals] ?? []
  ).map(goal => [goal, true]);
  const { handleSubmit, register, watch } = useForm<FormData>({
    defaultValues: Object.fromEntries(defaultEntries),
  });
  const [showError, setShowError] = useState(false);
  const growLongTermWealth = watch(
    InvestorProfileInvestmentGoal.growLongTermWealth,
  );
  const saveForRetirement = watch(
    InvestorProfileInvestmentGoal.saveForRetirement,
  );
  const buyAHome = watch(InvestorProfileInvestmentGoal.buyAHome);
  const payOffDebt = watch(InvestorProfileInvestmentGoal.payOffDebt);
  const supportLovedOnes = watch(
    InvestorProfileInvestmentGoal.supportLovedOnes,
  );
  const startMyOwnBusiness = watch(
    InvestorProfileInvestmentGoal.startMyOwnBusiness,
  );
  const hasEmptySelection =
    !growLongTermWealth &&
    !saveForRetirement &&
    !supportLovedOnes &&
    !buyAHome &&
    !payOffDebt &&
    !startMyOwnBusiness;

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
          label={t(InvestorProfileInvestmentGoal.supportLovedOnes)}
          {...register(InvestorProfileInvestmentGoal.supportLovedOnes)}
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
      {hasEmptySelection && showError && <Error />}
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
    gap: ${theme.spacing[6]};

    // For checkbox labels that wrap around, we want to align the text baseline
    label {
      align-items: baseline;
    }
  `}
`;

export default InvestmentGoalsForm;
