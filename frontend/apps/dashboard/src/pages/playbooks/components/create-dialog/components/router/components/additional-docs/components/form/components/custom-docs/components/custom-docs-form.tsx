import type { CustomDoc, DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoTrash16 } from '@onefootprint/icons';
import { Button, Form, LinkButton, Stack, TextArea, TextInput } from '@onefootprint/ui';
import get from 'lodash/get';
import React, { useId, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type CustomDocsFormProps = {
  index?: number;
  onCancel: (index: number, meta: { isCreating: boolean; isValid: boolean }) => void;
  onDelete: (index: number) => void;
  onSubmit: (index: number, customDoc: CustomDoc) => void;
};

const CustomDocsForm = ({ index = 0, onDelete, onCancel, onSubmit }: CustomDocsFormProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.custom-docs.form',
  });
  const id = useId();
  const { formState, register, trigger, setFocus, getValues, setValue } = useFormContext<DataToCollectFormData>();
  const nameAttrs = {
    name: `personal.additionalDocs.custom.${index}.name`,
    identifier: `personal.additionalDocs.custom.${index}.identifier`,
    description: `personal.additionalDocs.custom.${index}.description`,
  } as const;

  const [originalValues] = useState(() => {
    const [name, identifier, description] = getValues([nameAttrs.name, nameAttrs.identifier, nameAttrs.description]);
    return { name, identifier, description };
  });
  const isCreating = !originalValues.name && !originalValues.identifier && !originalValues.description;
  const formErrors = get(formState.errors, `personal.additionalDocs.custom.${index}`);

  const focusOnFirstInvalidField = () => {
    if (typeof formErrors === 'object') {
      const [name] = Object.keys(formErrors);
      if (name === 'name') {
        setFocus(nameAttrs.name);
      }
      if (name === 'identifier') {
        setFocus(nameAttrs.identifier);
      }
    }
  };

  const resetToOriginalValues = () => {
    setValue(nameAttrs.name, originalValues.name);
    setValue(nameAttrs.identifier, originalValues.identifier);
    setValue(nameAttrs.description, originalValues.description);
  };

  const getValuesAndSubmit = () => {
    const [name, identifier, description] = getValues([nameAttrs.name, nameAttrs.identifier, nameAttrs.description]);
    onSubmit(index, { name, identifier, description });
  };

  const handleCancel = async () => {
    resetToOriginalValues();
    const isValid = await trigger([nameAttrs.name, nameAttrs.identifier]);
    const meta = { isValid, isCreating };

    onCancel(index, meta);
  };

  const handleSubmit = async () => {
    const isValid = await trigger([nameAttrs.name, nameAttrs.identifier]);
    if (isValid) {
      getValuesAndSubmit();
    } else {
      focusOnFirstInvalidField();
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
