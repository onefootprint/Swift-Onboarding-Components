import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileData,
  InvestorProfileDI,
  InvestorProfileNetWorth,
} from '@onefootprint/types';
import { Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import CustomForm from '../../../../components/custom-form/custom-form';
import { NetWorthData } from '../../../../utils/state-machine/types';

export type NetWorthFormProps = {
  isLoading?: boolean;
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.netWorth>;
  onSubmit: (data: NetWorthData) => void;
};

type FormData = {
  netWorth: InvestorProfileNetWorth;
};

const NetWorthForm = ({
  isLoading,
  defaultValues,
  onSubmit,
}: NetWorthFormProps) => {
  const { t } = useTranslation('pages.net-worth');
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      netWorth:
        defaultValues?.[InvestorProfileDI.netWorth] ??
        InvestorProfileNetWorth.lt50k,
    },
  });

  const handleBeforeSubmit = (data: FormData) => {
    const { netWorth } = data;
    onSubmit({
      [InvestorProfileDI.netWorth]: netWorth,
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
      <Radio
        value={InvestorProfileNetWorth.lt50k}
        label={t(`${InvestorProfileNetWorth.lt50k}`)}
        {...register('netWorth')}
      />
      <Radio
        value={InvestorProfileNetWorth.s50kTo100k}
        label={t(`${InvestorProfileNetWorth.s50kTo100k}`)}
        {...register('netWorth')}
      />
      <Radio
        value={InvestorProfileNetWorth.s100kTo250k}
        label={t(`${InvestorProfileNetWorth.s100kTo250k}`)}
        {...register('netWorth')}
      />
      <Radio
        value={InvestorProfileNetWorth.s250kTo500k}
        label={t(`${InvestorProfileNetWorth.s250kTo500k}`)}
        {...register('netWorth')}
      />
      <Radio
        value={InvestorProfileNetWorth.S500kTo1m}
        label={t(`${InvestorProfileNetWorth.S500kTo1m}`)}
        {...register('netWorth')}
      />
      <Radio
        value={InvestorProfileNetWorth.gt1m}
        label={t(`${InvestorProfileNetWorth.gt1m}`)}
        {...register('netWorth')}
      />
    </CustomForm>
  );
};

export default NetWorthForm;
