import { useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import { DataKinds, VirtualDataKinds } from 'src/types/data-kind';
import { Checkbox } from 'ui';

import type { DataKindForm } from '../../create-onboarding-config.types';
import FormTitle from '../form-title';

type FormData = DataKindForm;

type AccessFormProps = {
  defaultValues?: DataKindForm;
  fields: Map<string, boolean>;
  onSubmit: (formData: DataKindForm) => void;
};

const AccessForm = ({ defaultValues, onSubmit, fields }: AccessFormProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create',
  );
  const { register, handleSubmit } = useForm<FormData>({ defaultValues });
  return (
    <form
      id="access-form"
      data-testid="access-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormTitle
        title={t('access-form.title')}
        description={t('access-form.description')}
      />
      {fields.has(DataKinds.phoneNumber) && (
        <Checkbox
          label={allT('data-kinds.phone_number')}
          {...register(DataKinds.phoneNumber)}
        />
      )}
      {fields.has(DataKinds.email) && (
        <Checkbox
          label={allT('data-kinds.email')}
          {...register(DataKinds.email)}
        />
      )}
      {fields.has(VirtualDataKinds.name) && (
        <Checkbox
          label={allT('data-kinds.name')}
          {...register(VirtualDataKinds.name)}
        />
      )}
      {fields.has(DataKinds.dob) && (
        <Checkbox label={allT('data-kinds.dob')} {...register(DataKinds.dob)} />
      )}
      {fields.has(DataKinds.ssn9) && (
        <Checkbox
          label={allT('data-kinds.ssn')}
          {...register(DataKinds.ssn9)}
        />
      )}
      {fields.has(DataKinds.ssn4) && (
        <Checkbox
          label={allT('data-kinds.last_four_ssn')}
          {...register(DataKinds.ssn4)}
        />
      )}
      {fields.has(VirtualDataKinds.addressFull) && (
        <Checkbox
          label={allT('data-kinds.address_full')}
          {...register(VirtualDataKinds.addressFull)}
        />
      )}
      {fields.has(VirtualDataKinds.addressPartial) && (
        <Checkbox
          label={allT('data-kinds.address_partial')}
          {...register(VirtualDataKinds.addressPartial)}
        />
      )}
    </form>
  );
};

export default AccessForm;
