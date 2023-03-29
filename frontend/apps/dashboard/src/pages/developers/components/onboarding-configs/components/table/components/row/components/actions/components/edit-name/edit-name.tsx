import { useTranslation } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { Dialog, TextInput } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import useUpdateOnboardingConfigs from 'src/pages/developers/components/onboarding-configs/hooks/use-update-onboarding-configs';

export type EditNameHandler = {
  launch: () => void;
};

export type EditNameProps = {
  onboardingConfig: OnboardingConfig;
};

type FormData = { name: string };

/*
  TODO:
  - add success and error toasts
  - fix imports to use the shortcuts
*/

const EditName = forwardRef<EditNameHandler, EditNameProps>(
  ({ onboardingConfig }, ref) => {
    const { t } = useTranslation('pages.onboarding-configs.edit');
    const [open, setOpen] = useState(false);
    const mutation = useUpdateOnboardingConfigs();

    const {
      reset,
      register,
      handleSubmit,
      formState: { errors, isDirty },
    } = useForm<FormData>({
      defaultValues: {
        name: onboardingConfig.name,
      },
    });

    const handleClose = () => {
      reset();
      setOpen(false);
    };

    const handleBeforeSubmit = (formData: FormData) => {
      if (isDirty) {
        mutation.mutate({ id: onboardingConfig.id, name: formData.name });
      }
      setOpen(false);
    };

    useImperativeHandle(
      ref,
      () => ({
        launch: () => setOpen(true),
      }),
      [],
    );

    return (
      <Dialog
        size="compact"
        title={t('title')}
        primaryButton={{
          form: 'edit-onboarding-config-form',
          label: t('cta'),
          type: 'submit',
        }}
        secondaryButton={{
          label: t('cancel'),
          onClick: handleClose,
        }}
        onClose={handleClose}
        open={open}
      >
        <form
          onSubmit={handleSubmit(handleBeforeSubmit)}
          id="edit-onboarding-config-form"
        >
          <TextInput
            autoFocus
            hasError={!!errors.name}
            hint={errors?.name?.message}
            label={t('form.name.label')}
            placeholder={t('form.name.placeholder')}
            {...register('name', {
              required: {
                value: true,
                message: t('form.name.errors.required'),
              },
            })}
          />
        </form>
      </Dialog>
    );
  },
);

export default EditName;
