import { IcoCode16, IcoUser16 } from '@onefootprint/icons';
import type { OnboardingConfig } from '@onefootprint/types';
import { Dialog, RadioSelect, Stack, TextInput } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useOrgSession from 'src/hooks/use-org-session';

export type CopyHandler = {
  launch: () => void;
};

export type CopyProps = {
  playbook: OnboardingConfig;
};

type FormData = {
  name: string;
  mode: 'sandbox' | 'live';
};

const Copy = forwardRef<CopyHandler, CopyProps>(({ playbook }, ref) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'copy' });
  const form = useForm<FormData>({
    defaultValues: {
      name: t('form.name.base', { name: playbook.name }),
      mode: 'sandbox',
    },
  });
  const org = useOrgSession();
  const [open, setOpen] = useState(false);

  const resetForm = () => {
    form.reset({
      name: t('form.name.base', { name: playbook.name }),
      mode: 'sandbox',
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      launch: () => setOpen(true),
    }),
    [],
  );

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = (formData: FormData) => {
    // eslint-disable-next-line no-console
    console.log(formData);
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      primaryButton={{
        label: t('form.cta'),
        type: 'submit',
        form: 'copy-playbook-form',
      }}
      secondaryButton={{
        label: t('form.cancel'),
        onClick: handleClose,
      }}
      size="compact"
      title={t('title')}
    >
      <form id="copy-playbook-form" onSubmit={form.handleSubmit(handleSubmit)}>
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
            defaultValue="sandbox"
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
                    disabled: org.data?.isSandboxRestricted,
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
    </Dialog>
  );
});

export default Copy;
