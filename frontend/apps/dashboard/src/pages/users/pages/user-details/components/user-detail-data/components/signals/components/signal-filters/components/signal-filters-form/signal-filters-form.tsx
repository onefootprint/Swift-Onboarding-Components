import { useTranslation } from '@onefootprint/hooks';
import { SignalAttribute } from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import Grid from '@onefootprint/ui/src/components/grid';
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
  const { t, allT } = useTranslation('pages.user-details.signals');
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
        <Grid.Row>
          <Grid.Column col={6}>
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.name')}
              value={SignalAttribute.name}
            />
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.email')}
              value={SignalAttribute.email}
            />
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.phone_number')}
              value={SignalAttribute.phoneNumber}
            />
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.dob')}
              value={SignalAttribute.dob}
            />
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.ssn')}
              value={SignalAttribute.ssn}
            />
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.document')}
              value={SignalAttribute.document}
            />
          </Grid.Column>
          <Grid.Column col={6}>
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.address')}
              value={SignalAttribute.address}
            />
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.street_address')}
              value={SignalAttribute.streetAddress}
            />
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.city')}
              value={SignalAttribute.city}
            />
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.state')}
              value={SignalAttribute.state}
            />
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.zip')}
              value={SignalAttribute.zip}
            />
            <Checkbox
              {...register('scope')}
              label={allT('signal-attributes.ip_address')}
              value={SignalAttribute.ipAddress}
            />
          </Grid.Column>
        </Grid.Row>
      </Fieldset>
    </form>
  );
};

export default SignalFiltersForm;
