import useValidateListEntries from '@/lists/hooks/use-validate-list-entries';
import { Form, Grid } from '@onefootprint/ui';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../create-dialog.types';
import useOptions from './hooks/use-options';

type CreateListFormProps = {
  onSubmit: (formData: FormData) => void;
};

const CreateListForm = ({ onSubmit }: CreateListFormProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'list.dialog' });
  const validateEntries = useValidateListEntries();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>();
  const kindOptions = useOptions();
  const kind = useWatch({ control, name: 'kind' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="create-list-form">
      <Grid.Container gap={7}>
        <Form.Field>
          <Form.Label>{t('form.name.label')}</Form.Label>
          <Form.Input
            autoFocus
            placeholder={t('form.name.placeholder')}
            {...register('name', {
              required: {
                value: true,
                message: t('form.name.errors.required'),
              },
            })}
          />
          <Form.Errors>{!!errors.name && errors.name.message}</Form.Errors>
        </Form.Field>
        <Form.Field>
          <Form.Label>{t('form.kind.label')}</Form.Label>
          <Controller
            control={control}
            name="kind"
            rules={{ required: true }}
            render={({ field }) => (
              <Form.Select
                {...field}
                onChange={e =>
                  field.onChange({
                    value: e.target.value,
                    label: kindOptions.find(opt => opt.value === e.target.value)?.label,
                  })
                }
                value={field.value?.value || ''}
              >
                <option value="" disabled>
                  {t('form.kind.placeholder')}
                </option>
                {kindOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            )}
          />
          <Form.Errors>{!!errors.kind && t('form.kind.errors.required')}</Form.Errors>
        </Form.Field>
        <Form.Field>
          <Form.Label>{t('form.entries.label')}</Form.Label>
          <Form.TextArea
            placeholder={t('form.entries.placeholder')}
            {...register('entries', {
              required: true,
              validate: val => validateEntries(kind.value ?? null, val) ?? undefined,
            })}
          />
          <Form.Errors>{!!errors.entries && errors.entries.message}</Form.Errors>
        </Form.Field>
      </Grid.Container>
    </form>
  );
};

export default CreateListForm;
