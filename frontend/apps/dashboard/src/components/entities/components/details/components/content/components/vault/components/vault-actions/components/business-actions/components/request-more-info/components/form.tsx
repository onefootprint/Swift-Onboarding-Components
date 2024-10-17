import { IcoPlusSmall16, IcoTrash16 } from '@onefootprint/icons';
import { type Entity, EntityStatus } from '@onefootprint/types';
import { Divider, Form, InlineAlert, LinkButton, Stack, Text } from '@onefootprint/ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormValues } from '../request-more-info.types';

type RequestMoreInfoFormProps = {
  entity: Entity;
  onSubmit: (data: FormValues) => void;
  businessOwners: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
};

const RequestMoreInfoForm = ({ entity, onSubmit, businessOwners }: RequestMoreInfoFormProps) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'request-more-info.form' });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      docs: [{ name: '', identifier: '', description: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'docs' });
  const showStatusWarning = entity.status === EntityStatus.inProgress || entity.status === EntityStatus.incomplete;

  const handleAddMore = () => {
    append({ name: '', identifier: '', description: '' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="request-more-info-form">
      {showStatusWarning && (
        <InlineAlert variant="warning" marginBottom={7}>
          {t('warning')}
        </InlineAlert>
      )}
      <Text variant="body-3" marginBottom={7}>
        {t('intro')}
      </Text>
      <Form.Field>
        <Form.Label>{t('beneficial-owner.label')}</Form.Label>
        <Form.Select size="compact" {...register('boId', { required: true })}>
          {businessOwners.map(owner => (
            <option key={owner.id} value={owner.id}>
              {owner.firstName} {owner.lastName}
            </option>
          ))}
        </Form.Select>
        <Form.Errors>{errors.boId?.message}</Form.Errors>
      </Form.Field>
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
    </form>
  );
};

export default RequestMoreInfoForm;
