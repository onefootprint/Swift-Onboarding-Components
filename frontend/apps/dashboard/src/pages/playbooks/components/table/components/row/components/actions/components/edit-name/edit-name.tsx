import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { OnboardingConfig } from '@onefootprint/types';
import { Dialog, TextInput, useToast } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import useUpdatePlaybook from 'src/pages/playbooks/utils/use-update-playbook';

export type EditNameHandler = {
  launch: () => void;
};

export type EditNameProps = {
  playbook: OnboardingConfig;
};

type FormData = { name: string };

const EditName = forwardRef<EditNameHandler, EditNameProps>(
  ({ playbook }, ref) => {
    const { t } = useTranslation('pages.playbooks.table.actions.edit-name');
    const [open, setOpen] = useState(false);
    const mutation = useUpdatePlaybook();
    const toast = useToast();
    const showErrorToast = useRequestErrorToast();

    const {
      reset,
      register,
      handleSubmit,
      formState: { errors, isDirty },
    } = useForm<FormData>({
      defaultValues: {
        name: playbook.name,
      },
    });

    const handleClose = () => {
      reset();
      setOpen(false);
    };

    const handleBeforeSubmit = (formData: FormData) => {
      if (isDirty) {
        mutation.mutate(
          { id: playbook.id, name: formData.name },
          {
            onSuccess: () => {
              toast.show({
                title: t('feedback.success.title'),
                description: t('feedback.success.description'),
              });
            },
            onError: (error: unknown) => {
              console.error(
                'Failed to edit playbook name',
                error,
                getErrorMessage(error),
              );
              showErrorToast(error);
            },
          },
        );
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
          form: 'edit-playbook-form',
          label: t('form.save'),
          type: 'submit',
        }}
        secondaryButton={{
          label: t('form.cancel'),
          onClick: handleClose,
        }}
        onClose={handleClose}
        open={open}
      >
        <form
          onSubmit={handleSubmit(handleBeforeSubmit)}
          id="edit-playbook-form"
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
