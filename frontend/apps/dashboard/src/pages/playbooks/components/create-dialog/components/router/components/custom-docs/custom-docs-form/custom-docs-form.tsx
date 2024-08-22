import type { CustomDoc, DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoTrash16 } from '@onefootprint/icons';
import type { CustomDocumentUploadSettings } from '@onefootprint/types';
import { Button, Divider, Form, LinkButton, Radio, Stack, Text, TextArea, TextInput } from '@onefootprint/ui';
import get from 'lodash/get';
import { useId, useState } from 'react';
import { type UseFieldArrayProps, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type CustomDocsFormProps = {
  index?: number;
  formName: UseFieldArrayProps<DataToCollectFormData, 'person.docs.additional.custom' | 'business.docs.custom'>['name'];
  onCancel: (index: number, meta: { isCreating: boolean; isValid: boolean }) => void;
  onDelete: (index: number) => void;
  onSubmit: (index: number, customDoc: CustomDoc) => void;
};

const CustomDocsForm = ({ index = 0, formName, onDelete, onCancel, onSubmit }: CustomDocsFormProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.custom-docs.form',
  });
  const id = useId();
  const { formState, register, trigger, setValue } = useFormContext<DataToCollectFormData>();
  const nameAttrs = {
    name: `${formName}.${index}.name`,
    identifier: `${formName}.${index}.identifier`,
    description: `${formName}.${index}.description`,
    uploadSettings: `${formName}.${index}.uploadSettings`,
  } as const;
  const [name, identifier, description, uploadSettings] = useWatch({
    name: [nameAttrs.name, nameAttrs.identifier, nameAttrs.description, nameAttrs.uploadSettings],
  });
  const [originalValues] = useState(() => ({ name, identifier, description, uploadSettings }));
  const isCreating = !originalValues.name && !originalValues.identifier && !originalValues.description;
  const formErrors = get(formState.errors, `${formName}.${index}`);

  const resetToOriginalValues = () => {
    setValue(`${formName}.${index}`, originalValues);
  };

  const getValuesAndSubmit = () => {
    onSubmit(index, { name, identifier, description, uploadSettings });
  };

  const handleCancel = async () => {
    resetToOriginalValues();
    const isValid = await trigger([nameAttrs.name, nameAttrs.identifier], { shouldFocus: true });
    const meta = { isValid, isCreating };

    onCancel(index, meta);
  };

  const handleSubmit = async () => {
    const isValid = await trigger([nameAttrs.name, nameAttrs.identifier], { shouldFocus: true });
    if (isValid) {
      getValuesAndSubmit();
    }
  };

  const handleDelete = () => {
    onDelete(index);
  };

  return (
    <Stack
      borderColor="tertiary"
      borderRadius="default"
      borderStyle="solid"
      borderWidth={1}
      direction="column"
      flex={1}
    >
      <Stack gap={5} direction="column" flex={1} padding={5}>
        <Form.Field>
          <Form.Label
            htmlFor={`name-${id}`}
            tooltip={{
              text: t('name.hint'),
            }}
          >
            {t('name.label')}
          </Form.Label>
          <TextInput
            id={`name-${id}`}
            placeholder={t('name.placeholder')}
            size="compact"
            autoFocus
            {...register(nameAttrs.name, {
              required: t('name.errors.required'),
            })}
          />
          <Form.Errors>{formErrors?.name?.message}</Form.Errors>
        </Form.Field>
        <Form.Field>
          <Form.Label
            htmlFor={`identifier-${id}`}
            tooltip={{
              text: t('identifier.hint'),
            }}
          >
            {t('identifier.label')}
          </Form.Label>
          <Form.Group>
            <Form.Addon size="compact">{t('identifier.placeholder')}</Form.Addon>
            <TextInput
              id={`identifier-${id}`}
              placeholder=""
              size="compact"
              {...register(nameAttrs.identifier, {
                required: t('identifier.errors.required'),
                validate: (value: string) => {
                  if (!value.match(/^[A-Za-z0-9_-]+$/)) {
                    return t('identifier.errors.no-special-chars');
                  }
                  return true;
                },
              })}
            />
          </Form.Group>
          <Form.Errors>{formErrors?.identifier?.message}</Form.Errors>
        </Form.Field>
        <Form.Field>
          <Form.Label
            htmlFor={`description-${id}`}
            tooltip={{
              text: t('description.hint'),
            }}
          >
            {t('description.label')}
          </Form.Label>
          <TextArea id={`description-${id}`} {...register(nameAttrs.description)} />
        </Form.Field>
      </Stack>
      <Stack flexDirection="column" paddingInline={5} paddingBottom={5}>
        <Divider variant="secondary" />
        <Stack flexDirection="column" gap={5} paddingTop={5}>
          <Text variant="label-3"> {t('collection-method.title')}</Text>
          <Stack flexDirection="column" gap={3}>
            <Radio<CustomDocumentUploadSettings>
              hint={t('collection-method.prefer-upload.hint')}
              label={t('collection-method.prefer-upload.label')}
              value="prefer_upload"
              {...register(nameAttrs.uploadSettings)}
            />
            <Radio<CustomDocumentUploadSettings>
              hint={t('collection-method.prefer-capture.hint')}
              label={t('collection-method.prefer-capture.label')}
              value="prefer_capture"
              {...register(nameAttrs.uploadSettings)}
            />
          </Stack>
        </Stack>
      </Stack>
      <Stack
        borderColor="tertiary"
        borderStyle="dashed"
        borderTopWidth={1}
        justifyContent="space-between"
        paddingBlock={4}
        paddingInline={5}
        tag="footer"
      >
        <Stack gap={3}>
          <Button size="compact" onClick={handleSubmit}>
            {allT('save')}
          </Button>
          <Button size="compact" variant="secondary" onClick={handleCancel}>
            {allT('cancel')}
          </Button>
        </Stack>
        {isCreating ? null : (
          <LinkButton
            variant="label-3"
            destructive
            iconComponent={IcoTrash16}
            iconPosition="left"
            onClick={handleDelete}
          >
            {allT('remove')}
          </LinkButton>
        )}
      </Stack>
    </Stack>
  );
};

export default CustomDocsForm;
