import { useTranslation } from '@onefootprint/hooks';
import { InvestorProfileData, InvestorProfileDI } from '@onefootprint/types';
import { Radio, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import CustomForm from '../../../../components/custom-form';
import { EmployedByBrokerageData } from '../../../../utils/state-machine/types';

export type BrokerageEmploymentFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    InvestorProfileDI.employedByBrokerageFirm
  >;
  isLoading?: boolean;
  onSubmit: (data: EmployedByBrokerageData) => void;
};

type FormData = {
  employed: 'true' | 'false';
  firm?: string;
};

const BrokerageEmploymentForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: BrokerageEmploymentFormProps) => {
  const { t } = useTranslation('pages.brokerage-employment');
  const defaultFirm =
    defaultValues?.[InvestorProfileDI.employedByBrokerageFirm];
  const hasDefaultFirm =
    typeof defaultFirm === 'string' && defaultFirm.length > 0;

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      employed: hasDefaultFirm ? 'true' : 'false',
      firm: defaultFirm,
    },
  });

  const isEmployed = watch('employed');
  const handleBeforeSubmit = (data: FormData) => {
    const { employed, firm = '' } = data;
    onSubmit({
      [InvestorProfileDI.employedByBrokerageFirm]:
        employed === 'true' ? firm : '',
    });
  };

  return (
    <CustomForm
      title={t('title')}
      subtitle={t('subtitle')}
      isLoading={isLoading}
      formAttributes={{
        onSubmit: handleSubmit(handleBeforeSubmit),
      }}
    >
      <Radio value="false" label={t('status.no')} {...register('employed')} />
      <Radio value="true" label={t('status.yes')} {...register('employed')} />
      {isEmployed === 'true' && (
        <TextInput
          data-private
          hasError={!!errors.firm}
          hint={errors.firm ? t('firm.error') : undefined}
          placeholder={t('firm.placeholder')}
          label={t('firm.label')}
          {...register('firm', {
            required: true,
          })}
        />
      )}
    </CustomForm>
  );
};

export default BrokerageEmploymentForm;
