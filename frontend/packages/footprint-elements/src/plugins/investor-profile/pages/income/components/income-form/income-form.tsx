import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileAnnualIncome,
  InvestorProfileData,
  InvestorProfileDI,
} from '@onefootprint/types';
import { Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button';
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
  const { t } = useTranslation('pages.income.form');
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
    <Form onSubmit={handleSubmit(handleBeforeSubmit)}>
      <OptionsContainer data-private>
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
      </OptionsContainer>
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

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[6]};
  `}
`;

export default IncomeForm;
