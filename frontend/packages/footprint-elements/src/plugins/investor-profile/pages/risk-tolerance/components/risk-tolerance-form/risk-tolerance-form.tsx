import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
  InvestorProfileRiskTolerance,
} from '@onefootprint/types';
import { Radio, Typography } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button';
import { RiskToleranceData } from '../../../../utils/state-machine/types';

export type RiskToleranceFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    InvestorProfileDataAttribute.riskTolerance
  >;
  isLoading?: boolean;
  onSubmit: (data: RiskToleranceData) => void;
};

const RiskToleranceForm = ({
  isLoading,
  defaultValues,
  onSubmit,
}: RiskToleranceFormProps) => {
  const { t } = useTranslation('pages.risk-tolerance.form');
  const { handleSubmit, register } = useForm<RiskToleranceData>({
    defaultValues,
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <OptionsContainer data-private>
        <RadioContainer>
          <Radio
            value={InvestorProfileRiskTolerance.conservative}
            label={t(`${InvestorProfileRiskTolerance.conservative}.label`)}
            {...register(InvestorProfileDataAttribute.riskTolerance)}
          />
          <Typography variant="body-3" color="tertiary">
            {t(`${InvestorProfileRiskTolerance.conservative}.description`)}
          </Typography>
        </RadioContainer>
        <RadioContainer>
          <Radio
            value={InvestorProfileRiskTolerance.moderate}
            label={t(`${InvestorProfileRiskTolerance.moderate}.label`)}
            {...register(InvestorProfileDataAttribute.riskTolerance)}
          />
          <Typography variant="body-3" color="tertiary">
            {t(`${InvestorProfileRiskTolerance.moderate}.description`)}
          </Typography>
        </RadioContainer>
        <RadioContainer>
          <Radio
            value={InvestorProfileRiskTolerance.aggressive}
            label={t(`${InvestorProfileRiskTolerance.aggressive}.label`)}
            {...register(InvestorProfileDataAttribute.riskTolerance)}
          />
          <Typography variant="body-3" color="tertiary">
            {t(`${InvestorProfileRiskTolerance.aggressive}.description`)}
          </Typography>
        </RadioContainer>
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

const RadioContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[2]};
  `}
`;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[6]};
  `}
`;

export default RiskToleranceForm;
