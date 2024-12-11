import { Form, Grid } from '@onefootprint/ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from './edit-dialog-form.types';

type EditDialogFormProps = {
  defaultName?: string;
  handleBeforeSubmit: (formData: FormData) => void;
};

const EditDialogForm = ({ defaultName, handleBeforeSubmit }: EditDialogFormProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'details.header.edit-dialog' });
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
  }, [defaultName]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
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
  );
};

export default EditDialogForm;
