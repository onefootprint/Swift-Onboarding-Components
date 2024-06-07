import { Form, TextInput } from '@onefootprint/ui';
import React, { useId } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type IdentifierInputProps = {
  customDocIdentifierFormField: string;
  disabled?: boolean;
};

const IDENTIFIER_PREFIX = 'document.custom.';

const IdentifierInput = ({ customDocIdentifierFormField, disabled }: IdentifierInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.custom-doc-request-form.document-identifier',
  });
  const id = useId();
  const {
    register,
    formState: { isSubmitted },
    setValue,
    getFieldState,
  } = useFormContext();

  const getIdentifierError = (value?: string) => {
    if (!value) return t('errors.required');
    const sanitizedValue = value.replace(IDENTIFIER_PREFIX, '');
    if (sanitizedValue.length === 0) return t('errors.required');
    if (!sanitizedValue.match(/^[A-Za-z0-9_-]+$/)) return t('errors.no-special-characters');
    return undefined;
  };

  register(customDocIdentifierFormField, {
    validate: getIdentifierError,
  });
  const identifierFieldState = getFieldState(customDocIdentifierFormField);
  const handleChangeIdentifier = (value: string) => {
    setValue(customDocIdentifierFormField, `${IDENTIFIER_PREFIX}${value}`, {
      shouldValidate: isSubmitted,
    });
  };

  return (
    <Form.Field>
      <Form.Label
        htmlFor={id}
        tooltip={{
          text: t('tooltip'),
        }}
      >
        {t('label')}
      </Form.Label>
      <Form.Group>
        <Form.Addon>{IDENTIFIER_PREFIX}</Form.Addon>
        <TextInput
          disabled={disabled}
          hasError={!!identifierFieldState.error}
          id={id}
          onChangeText={handleChangeIdentifier}
          placeholder=""
        />
      </Form.Group>
      <Form.Errors>{identifierFieldState.error?.message}</Form.Errors>
    </Form.Field>
  );
};

export default IdentifierInput;
