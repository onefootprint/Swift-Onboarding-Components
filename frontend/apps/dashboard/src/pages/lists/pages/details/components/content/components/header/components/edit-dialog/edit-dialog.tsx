import { Dialog, Form, Grid, useToast } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useListDetails from 'src/pages/lists/pages/details/hooks/use-list-details';
import getAliasforListName from 'src/pages/lists/utils/get-alias-for-list-name';

import useUpdateList from './hooks/use-update-list';

export type EditDialogProps = {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
};

type FormData = {
  name: string;
};

const EditDialog = ({ open, onClose, onEdit }: EditDialogProps) => {
  const router = useRouter();
  const id = router.query.id as string;
  const updateListMutation = useUpdateList(id);
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.header.edit-dialog',
  });
  const { data } = useListDetails(id);
  const defaultName = data?.name;
  const toast = useToast();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { name: defaultName },
  });

  useEffect(() => {
    reset({ name: defaultName });
  }, [open, defaultName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBeforeSubmit = (formData: FormData) => {
    updateListMutation.mutate(
      {
        name: formData.name,
        alias: getAliasforListName(formData.name),
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          reset();
          onEdit();
        },
      },
    );
  };

  return (
    <Dialog
      size="compact"
      onClose={onClose}
      open={open}
      title={t('title')}
      primaryButton={{
        form: 'update-list-form',
        label: t('cta.save.label'),
        loading: updateListMutation.isPending,
        loadingAriaLabel: t('cta.save.aria-label'),
        type: 'submit',
      }}
      secondaryButton={{
        disabled: updateListMutation.isPending,
        label: t('cta.cancel'),
        onClick: onClose,
      }}
    >
      <form onSubmit={handleSubmit(handleBeforeSubmit)} id="update-list-form">
        <Grid.Container gap={7}>
          <Form.Field>
            <Form.Label>{t('form.name.label')}</Form.Label>
            <Form.Input
              autoFocus
              placeholder={t('form.name.placeholder')}
              {...register('name', {
                required: t('form.name.errors.required'),
              })}
            />
            <Form.Errors>{errors.name?.message}</Form.Errors>
          </Form.Field>
        </Grid.Container>
      </form>
    </Dialog>
  );
};

export default EditDialog;
