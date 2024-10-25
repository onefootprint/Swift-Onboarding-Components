import { IcoPlusSmall16, IcoTrash16 } from '@onefootprint/icons';
import { Divider, Form, LinkButton, Stack } from '@onefootprint/ui';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { UploadDocsFormValues } from '../request-more-info.types';

type UploadDocsFormProps = {
  onSubmit: (data: UploadDocsFormValues) => void;
  businessOwners: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
};

const UploadDocsForm = ({ onSubmit, businessOwners }: UploadDocsFormProps) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'request-more-info.upload-docs-form' });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadDocsFormValues>({
    defaultValues: {
      docs: [{ name: '', identifier: '', description: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'docs' });
  const boId = useWatch({ control, name: 'boId' });

  const handleAddMore = () => {
    append({ name: '', identifier: '', description: '' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="request-more-info-form">
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
      {boId ? (
        <>
          <Divider variant="secondary" marginBlock={7} />
          <Stack flexDirection="column" gap={5}>
            {fields.map((field, index) => (
              <Stack
                key={field.id}
                borderColor="tertiary"
                borderRadius="default"
                borderStyle="solid"
                borderWidth={1}
                flexDirection="column"
                gap={5}
                padding={5}
              >
                <Stack flexDirection="column" gap={7}>
                  <Form.Field>
                    <Form.Label tooltip={{ text: t('document.name.tooltip') }}>{t('document.name.label')}</Form.Label>
                    <Form.Input
                      autoFocus
                      placeholder={t('document.name.placeholder')}
                      size="compact"
                      {...register(`docs.${index}.name`, {
                        required: t('document.name.error'),
                      })}
                    />
                    <Form.Errors>{errors.docs?.[index]?.name?.message}</Form.Errors>
                  </Form.Field>
                  <Form.Field>
                    <Form.Label tooltip={{ text: t('document.identifier.tooltip') }}>
                      {t('document.identifier.label')}
                    </Form.Label>
                    <Form.Group>
                      <Form.Addon size="compact">{t('document.identifier.prefix')}</Form.Addon>
                      <Form.Input
                        placeholder=""
                        size="compact"
                        {...register(`docs.${index}.identifier`, {
                          required: t('document.identifier.error.required'),
                          validate: (value: string) => {
                            if (!value.match(/^[A-Za-z0-9_-]+$/)) {
                              return t('document.identifier.error.invalid');
                            }
                            return true;
                          },
                        })}
                      />
                    </Form.Group>
                    <Form.Errors>{errors.docs?.[index]?.identifier?.message}</Form.Errors>
                  </Form.Field>
                  <Form.Field>
                    <Form.Label>{t('document.description.label')}</Form.Label>
                    <Form.TextArea {...register(`docs.${index}.description`)} />
                    <Form.Errors>{errors.docs?.[index]?.description?.message}</Form.Errors>
                  </Form.Field>
                </Stack>
                {fields.length > 1 && (
                  <LinkButton onClick={() => remove(index)} destructive iconComponent={IcoTrash16} iconPosition="left">
                    {t('remove')}
                  </LinkButton>
                )}
              </Stack>
            ))}
            <LinkButton onClick={handleAddMore} variant="label-3" iconComponent={IcoPlusSmall16} iconPosition="left">
              {t('add')}
            </LinkButton>
          </Stack>
          <Divider variant="secondary" marginBlock={7} />
          <Form.Field>
            <Form.Label>{t('note.label')}</Form.Label>
            <Form.TextArea placeholder={t('note.placeholder')} {...register('note')} />
            <Form.Errors>{errors.note?.message}</Form.Errors>
          </Form.Field>
        </>
      ) : null}
    </form>
  );
};

export default UploadDocsForm;
