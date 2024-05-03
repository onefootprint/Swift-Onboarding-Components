import { IcoCode16, IcoUser16 } from '@onefootprint/icons';
import type { OnboardingConfig } from '@onefootprint/types';
import { RadioSelect, Stack, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type CopyHandler = {
  launch: () => void;
};

type FormData = {
  name: string;
  mode: 'sandbox' | 'live';
};

export type FormProps = {
  playbook: OnboardingConfig;
  onSubmit: (data: FormData) => void;
  isOrgSandboxRestricted?: boolean;
};

const Form = ({
  onSubmit,
  playbook,
  isOrgSandboxRestricted = false,
}: FormProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'copy' });
  const form = useForm<FormData>({
    defaultValues: {
      name: t('form.name.base', { name: playbook.name }),
      mode: 'sandbox',
    },
  });

  return (
    <form id="copy-playbook-form" onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap={7} direction="column">
        <TextInput
          autoFocus
          label={t('form.name.label')}
          placeholder={t('form.name.placeholder')}
          {...form.register('name', { required: true })}
        />
        <Controller
          control={form.control}
          name="mode"
          render={({ field }) => (
            <RadioSelect
              label={t('form.target.label')}
              onChange={field.onChange}
              options={[
                {
                  IconComponent: IcoCode16,
                  title: t('form.target.options.sandbox'),
                  value: 'sandbox',
                },
                {
                  disabled: isOrgSandboxRestricted,
                  disabledHint: t('form.target.hint'),
                  IconComponent: IcoUser16,
                  title: t('form.target.options.live'),
                  value: 'live',
                },
              ]}
              size="compact"
              value={field.value}
            />
          )}
        />
      </Stack>
    </form>
  );
};

export default Form;
