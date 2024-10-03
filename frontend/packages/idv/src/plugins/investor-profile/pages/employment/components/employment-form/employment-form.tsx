import { InvestorProfileDI } from '@onefootprint/types';
import type { SelectOption } from '@onefootprint/ui';
import { Select, TextInput } from '@onefootprint/ui';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormWithErrorAndFooter from '../../../../components/form-with-error-footer';

import type { EmploymentData } from '../../../../utils/state-machine/types';

export type EmploymentFormProps = {
  defaultValues?: Partial<EmploymentData>;
  footer: React.ReactNode;
  onSubmit: (data: EmploymentData) => void;
};

type FormData = {
  status: SelectOption;
  occupation?: string;
  employer?: string;
};

const EmploymentForm = ({ defaultValues, footer, onSubmit }: EmploymentFormProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.pages.employment' });
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

  const defaultStatus = options.find(({ value }) => value === defaultValues?.[InvestorProfileDI.employmentStatus]);
  const defaultOccupation = defaultValues?.[InvestorProfileDI.occupation];
  const defaultEmployer = defaultValues?.[InvestorProfileDI.employer];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      status: defaultStatus || options.at(0),
      occupation: defaultOccupation,
      employer: defaultEmployer,
    },
  });

  const employmentStatus = watch('status') as SelectOption;
  const handleBeforeSubmit = (formData: FormData) => {
    const { status, occupation = '', employer = '' } = formData;
    const isEmployed = status.value === 'employed';
    onSubmit({
      [InvestorProfileDI.employmentStatus]: status.value,
      [InvestorProfileDI.occupation]: isEmployed ? occupation : '',
      [InvestorProfileDI.employer]: isEmployed ? employer : '',
    });
  };

  return (
    <FormWithErrorAndFooter footer={footer} formAttributes={{ onSubmit: handleSubmit(handleBeforeSubmit) }}>
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
        <>
          <TextInput
            data-dd-privacy="mask"
            hasError={!!errors.occupation}
            hint={errors.occupation ? t('occupation.error') : undefined}
            label={t('occupation.label')}
            placeholder={t('occupation.placeholder')}
            {...register('occupation', {
              required: true,
            })}
          />
          <TextInput
            data-dd-privacy="mask"
            hasError={!!errors.employer}
            hint={errors.employer ? t('employer.error') : undefined}
            label={t('employer.label')}
            placeholder={t('employer.placeholder')}
            {...register('employer', {
              required: true,
            })}
          />
        </>
      )}
    </FormWithErrorAndFooter>
  );
};

export default EmploymentForm;
