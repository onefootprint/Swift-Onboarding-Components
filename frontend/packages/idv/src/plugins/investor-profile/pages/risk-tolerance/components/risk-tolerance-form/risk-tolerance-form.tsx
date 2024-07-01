import type { InvestorProfileData } from '@onefootprint/types';
import { InvestorProfileDI, InvestorProfileRiskTolerance } from '@onefootprint/types';
import { Grid, Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormWithErrorAndFooter from '../../../../components/form-with-error-footer';
import type { RiskToleranceData } from '../../../../utils/state-machine/types';

export type RiskToleranceFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.riskTolerance>;
  footer: React.ReactNode;
  onSubmit: (data: RiskToleranceData) => void;
};

type FormData = { riskTolerance: InvestorProfileRiskTolerance };

const DiRiskTolerance = InvestorProfileDI.riskTolerance;
const { aggressive, conservative, moderate } = InvestorProfileRiskTolerance;

const RiskToleranceForm = ({ defaultValues, footer, onSubmit }: RiskToleranceFormProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.pages.risk-tolerance' });
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: { riskTolerance: defaultValues?.[DiRiskTolerance] ?? conservative },
  });

  const handleBeforeSubmit = (data: FormData) => {
    onSubmit({ [DiRiskTolerance]: data.riskTolerance });
  };

  return (
    <FormWithErrorAndFooter formAttributes={{ onSubmit: handleSubmit(handleBeforeSubmit) }} footer={footer}>
      <Grid.Container gap={2}>
        <Radio
          value={conservative}
          label={t(`${conservative}.label`)}
          hint={t(`${conservative}.description`)}
          {...register('riskTolerance')}
        />
      </Grid.Container>
      <Grid.Container gap={2}>
        <Radio
          value={moderate}
          label={t(`${moderate}.label`)}
          hint={t(`${moderate}.description`)}
          {...register('riskTolerance')}
        />
      </Grid.Container>
      <Grid.Container gap={2}>
        <Radio
          value={aggressive}
          label={t(`${aggressive}.label`)}
          hint={t(`${aggressive}.description`)}
          {...register('riskTolerance')}
        />
      </Grid.Container>
    </FormWithErrorAndFooter>
  );
};

export default RiskToleranceForm;
