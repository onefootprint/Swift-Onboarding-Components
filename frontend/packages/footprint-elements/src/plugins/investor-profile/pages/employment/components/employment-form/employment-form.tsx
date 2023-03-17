import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
  InvestorProfileEmploymentStatus,
} from '@onefootprint/types';
import { Select, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button';
import { EmploymentData } from '../../../../utils/state-machine/types';

export type EmploymentFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    | InvestorProfileDataAttribute.employmentStatus
    | InvestorProfileDataAttribute.occupation
  >;
  isLoading?: boolean;
  onSubmit: (data: EmploymentData) => void;
};

const EmploymentForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: EmploymentFormProps) => {
  const { t } = useTranslation('pages.employment.form');
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EmploymentData>({
    defaultValues,
  });
  const employmentStatus = watch(InvestorProfileDataAttribute.employmentStatus);

  const options = [
    {
      label: t('employment-status.employed'),
      value: InvestorProfileEmploymentStatus.employed,
    },
    {
      label: t('employment-status.unemployed'),
      value: InvestorProfileEmploymentStatus.unemployed,
    },
  ];

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name={InvestorProfileDataAttribute.employmentStatus}
        rules={{ required: true }}
        render={({ field, fieldState: { error } }) => {
          const value =
            typeof field.value === 'object' ? field.value : undefined;
          return (
            <Select
              isPrivate
              label={t('employment-status.label')}
              onBlur={field.onBlur}
              options={options}
              onChange={nextOption => {
                field.onChange(nextOption);
              }}
              hint={error && t('employment-status.error')}
              hasError={!!error}
              placeholder={t('employment-status.placeholder')}
              value={value}
            />
          );
        }}
      />
      {employmentStatus === InvestorProfileEmploymentStatus.employed && (
        <TextInput
          data-private
          hasError={!!errors[InvestorProfileDataAttribute.occupation]}
          hint={
            errors[InvestorProfileDataAttribute.occupation]
              ? t('occupation.error')
              : undefined
          }
          label={t('occupation.label')}
          placeholder={t('occupation.placeholder')}
          {...register(InvestorProfileDataAttribute.occupation, {
            required: true,
          })}
        />
      )}
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

export default EmploymentForm;
