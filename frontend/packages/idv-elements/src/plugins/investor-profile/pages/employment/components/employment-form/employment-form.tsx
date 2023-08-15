import { useTranslation } from '@onefootprint/hooks';
import { InvestorProfileData, InvestorProfileDI } from '@onefootprint/types';
import { Select, SelectOption, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import CustomForm from '../../../../components/custom-form';
import { EmploymentData } from '../../../../utils/state-machine/types';

export type EmploymentFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.occupation>;
  isLoading?: boolean;
  onSubmit: (data: EmploymentData) => void;
};

type FormData = {
  status: SelectOption;
  occupation?: string;
};

const EmploymentForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: EmploymentFormProps) => {
  const { t } = useTranslation('pages.employment');
  const options: SelectOption[] = [
    {
      label: t('employment-status.employed'),
      value: 'employed',
    },
    {
      label: t('employment-status.unemployed'),
      value: 'unemployed',
    },
    {
      label: t('employment-status.retired'),
      value: 'retired',
    },
    {
      label: t('employment-status.student'),
      value: 'student',
    },
  ];

  const defaultOccupation = defaultValues?.[InvestorProfileDI.occupation];
  const hasDefaultOccupation =
    typeof defaultOccupation === 'string' && defaultOccupation.length > 0;
  const defaultEmploymentStatus = hasDefaultOccupation
    ? 'employed'
    : 'unemployed';
  const defaultOption = options.find(
    option => option.value === defaultEmploymentStatus,
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      status: defaultOption ?? options[0],
      occupation: defaultOccupation,
    },
  });

  const employmentStatus = watch('status') as SelectOption;
  const handleBeforeSubmit = (formData: FormData) => {
    const {
      status: { value },
      occupation = '',
    } = formData;
    onSubmit({
      [InvestorProfileDI.occupation]: value === 'employed' ? occupation : '',
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
      <Controller
        control={control}
        name="status"
        rules={{ required: true }}
        render={({ field, fieldState: { error } }) => (
          <Select
            isPrivate
            label={t('employment-status.label')}
            onBlur={field.onBlur}
            options={options}
            onChange={field.onChange}
            hint={error && t('employment-status.error')}
            hasError={!!error}
            placeholder={t('employment-status.placeholder')}
            value={field.value}
          />
        )}
      />
      {employmentStatus.value === 'employed' && (
        <TextInput
          data-private
          hasError={!!errors.occupation}
          hint={errors.occupation ? t('occupation.error') : undefined}
          label={t('occupation.label')}
          placeholder={t('occupation.placeholder')}
          {...register('occupation', {
            required: true,
          })}
        />
      )}
    </CustomForm>
  );
};

export default EmploymentForm;
