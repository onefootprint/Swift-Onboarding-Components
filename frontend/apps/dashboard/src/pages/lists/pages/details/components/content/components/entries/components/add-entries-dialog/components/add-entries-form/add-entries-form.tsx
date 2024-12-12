import useValidateListEntries from '@/lists/hooks/use-validate-list-entries';
import { getOrgListsByListIdOptions } from '@onefootprint/axios/dashboard';
import { Form, Grid } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../add-entries-dialog.types';

type AddEntriesFormProps = {
  onSubmit: (formData: FormData) => void;
};

const AddEntriesForm = ({ onSubmit }: AddEntriesFormProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'details.entries.add-entries-dialog' });
  const router = useRouter();
  const id = router.query.id as string;
  const { data: list } = useQuery(getOrgListsByListIdOptions({ path: { listId: id } }));
  const validateEntries = useValidateListEntries();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  if (!list) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="add-entries-form">
      <Grid.Container gap={7}>
        <Form.Field>
          <Form.Label>{t('form.entries.label')}</Form.Label>
          <Form.TextArea
            placeholder={t('form.entries.placeholder')}
            hint={t('form.entries.hint')}
            {...register('entries', {
              required: t('form.entries.errors.required'),
              validate: val => validateEntries(list.kind, val),
            })}
          />
          <Form.Errors>{errors.entries?.message}</Form.Errors>
        </Form.Field>
      </Grid.Container>
    </form>
  );
};

export default AddEntriesForm;
