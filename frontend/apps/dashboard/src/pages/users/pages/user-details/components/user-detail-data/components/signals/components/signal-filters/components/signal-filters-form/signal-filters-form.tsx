import { useTranslation } from '@onefootprint/hooks';
import { Checkbox } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import Fieldset from 'src/components/fieldset';

export type FormData = {
  severity: string[];
  scope: string[];
};

type SignalFiltersFormProps = {
  onSubmit: (formData: FormData) => void;
  defaultValues: {
    severity: string[];
    scope: string[];
  };
};

const defaultFormValue = {
  severity: [],
  scope: [],
};

const SignalFiltersForm = ({
  defaultValues,
  onSubmit,
}: SignalFiltersFormProps) => {
  const { t } = useTranslation('pages.user-details.signals');
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues,
  });

  const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset(defaultFormValue);
  };

  return (
    <form
      id="signals-filters"
      name="signals-filters"
      onReset={handleReset}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Fieldset title={t('filters.severity.title')}>
        <Checkbox
          {...register('severity')}
          label={t('severity.high')}
          value="high"
        />
        <Checkbox
          {...register('severity')}
          label={t('severity.medium')}
          value="medium"
        />
        <Checkbox
          {...register('severity')}
          label={t('severity.low')}
          value="low"
        />
      </Fieldset>
      <Fieldset title={t('filters.scope.title')}>
        <Checkbox {...register('scope')} label="Identity" value="identity" />
        <Checkbox
          {...register('scope')}
          label="Phone number"
          value="phone_number"
        />
      </Fieldset>
    </form>
  );
};

export default SignalFiltersForm;
