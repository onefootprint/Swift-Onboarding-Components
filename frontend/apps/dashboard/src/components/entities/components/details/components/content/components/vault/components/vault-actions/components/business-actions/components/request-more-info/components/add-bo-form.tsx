import { Divider, Form, Stack } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { AddBoFormValues } from '../request-more-info.types';

type AddBoFormProps = {
  onSubmit: (data: AddBoFormValues) => void;
  businessOwners: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
};

const AddBoForm = ({ onSubmit, businessOwners }: AddBoFormProps) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'request-more-info.add-bo-form' });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddBoFormValues>({});

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="request-more-info-form">
      <Stack direction="column" gap={6}>
        <Form.Field>
          <Form.Label>{t('bo.label')}</Form.Label>
          <Form.Select size="compact" {...register('boId', { required: t('bo.errors.required') })}>
            <option value="">{t('bo.placeholder')}</option>
            {businessOwners.map(owner => (
              <option key={owner.id} value={owner.id}>
                {owner.firstName} {owner.lastName}
              </option>
            ))}
          </Form.Select>
          <Form.Errors>{errors.boId?.message}</Form.Errors>
        </Form.Field>
        <Divider variant="secondary" marginTop={2} />
        <Form.Field>
          <Form.Label>{t('note.label')}</Form.Label>
          <Form.TextArea placeholder={t('note.placeholder')} {...register('note')} />
          <Form.Errors>{errors.note?.message}</Form.Errors>
        </Form.Field>
      </Stack>
    </form>
  );
};

export default AddBoForm;
