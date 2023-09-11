import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { InvestorProfileData } from '@onefootprint/types';
import {
  InvestorProfileDI,
  InvestorProfileRiskTolerance,
} from '@onefootprint/types';
import { Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import CustomForm from '../../../../components/custom-form';
import type { RiskToleranceData } from '../../../../utils/state-machine/types';

export type RiskToleranceFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.riskTolerance>;
  isLoading?: boolean;
  onSubmit: (data: RiskToleranceData) => void;
};

type FormData = {
  riskTolerance: InvestorProfileRiskTolerance;
};

const RiskToleranceForm = ({
  isLoading,
  defaultValues,
  onSubmit,
}: RiskToleranceFormProps) => {
  const { t } = useTranslation('pages.risk-tolerance');
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      riskTolerance:
        defaultValues?.[InvestorProfileDI.riskTolerance] ??
        InvestorProfileRiskTolerance.conservative,
    },
  });

  const handleBeforeSubmit = (data: FormData) => {
    const { riskTolerance } = data;
    onSubmit({
      [InvestorProfileDI.riskTolerance]: riskTolerance,
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
      <RadioContainer>
        <Radio
          value={InvestorProfileRiskTolerance.conservative}
          label={t(`${InvestorProfileRiskTolerance.conservative}.label`)}
          hint={t(`${InvestorProfileRiskTolerance.conservative}.description`)}
          {...register('riskTolerance')}
        />
      </RadioContainer>
      <RadioContainer>
        <Radio
          value={InvestorProfileRiskTolerance.moderate}
          label={t(`${InvestorProfileRiskTolerance.moderate}.label`)}
          hint={t(`${InvestorProfileRiskTolerance.moderate}.description`)}
          {...register('riskTolerance')}
        />
      </RadioContainer>
      <RadioContainer>
        <Radio
          value={InvestorProfileRiskTolerance.aggressive}
          label={t(`${InvestorProfileRiskTolerance.aggressive}.label`)}
          hint={t(`${InvestorProfileRiskTolerance.aggressive}.description`)}
          {...register('riskTolerance')}
        />
      </RadioContainer>
    </CustomForm>
  );
};

const RadioContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[2]};
  `}
`;

export default RiskToleranceForm;
