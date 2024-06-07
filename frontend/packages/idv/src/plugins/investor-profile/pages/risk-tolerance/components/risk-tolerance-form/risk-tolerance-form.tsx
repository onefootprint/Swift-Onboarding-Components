import type { InvestorProfileData } from '@onefootprint/types';
import { InvestorProfileDI, InvestorProfileRiskTolerance } from '@onefootprint/types';
import { Grid, Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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

const RiskToleranceForm = ({ isLoading, defaultValues, onSubmit }: RiskToleranceFormProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'investor-profile.pages.risk-tolerance',
  });
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      riskTolerance: defaultValues?.[InvestorProfileDI.riskTolerance] ?? InvestorProfileRiskTolerance.conservative,
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
      <Grid.Container gap={2}>
        <Radio
          value={InvestorProfileRiskTolerance.conservative}
          label={t(`${InvestorProfileRiskTolerance.conservative}.label`)}
          hint={t(`${InvestorProfileRiskTolerance.conservative}.description`)}
          {...register('riskTolerance')}
        />
      </Grid.Container>
      <Grid.Container gap={2}>
        <Radio
          value={InvestorProfileRiskTolerance.moderate}
          label={t(`${InvestorProfileRiskTolerance.moderate}.label`)}
          hint={t(`${InvestorProfileRiskTolerance.moderate}.description`)}
          {...register('riskTolerance')}
        />
      </Grid.Container>
      <Grid.Container gap={2}>
        <Radio
          value={InvestorProfileRiskTolerance.aggressive}
          label={t(`${InvestorProfileRiskTolerance.aggressive}.label`)}
          hint={t(`${InvestorProfileRiskTolerance.aggressive}.description`)}
          {...register('riskTolerance')}
        />
      </Grid.Container>
    </CustomForm>
  );
};

export default RiskToleranceForm;
