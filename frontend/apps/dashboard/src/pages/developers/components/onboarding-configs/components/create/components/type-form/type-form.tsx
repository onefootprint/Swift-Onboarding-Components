import { useTranslation } from '@onefootprint/hooks';
import { IcoIdCard24, IcoStore24 } from '@onefootprint/icons';
import { RadioSelect } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import getFormIdForState from '../../utils/get-form-id-for-state';
import FormTitle from '../form-title';
import { useOnboardingConfigMachine } from '../machine-provider';

type FormData = {
  type: 'kyb' | 'kyc';
};

const TypeForm = () => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create-dialog.type-form',
  );
  const [state, send] = useOnboardingConfigMachine();
  const { type } = state.context;

  const { handleSubmit, control } = useForm<FormData>({
    defaultValues: { type: type ?? 'kyc' },
  });

  const onSubmit = (data: FormData) => {
    send({
      type: 'typeSubmitted',
      payload: {
        type: data.type,
      },
    });
  };

  return (
    <form
      data-testid={getFormIdForState(state.value)}
      id={getFormIdForState(state.value)}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormTitle title={t('title')} description={t('description')} />
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <RadioSelect
            options={[
              {
                title: t('kyc.title'),
                description: t('kyc.description'),
                value: 'kyc',
                IconComponent: IcoIdCard24,
              },
              {
                title: t('kyb.title'),
                description: t('kyb.description'),
                value: 'kyb',
                IconComponent: IcoStore24,
              },
            ]}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </form>
  );
};

export default TypeForm;
