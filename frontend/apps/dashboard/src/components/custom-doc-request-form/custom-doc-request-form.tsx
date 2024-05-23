import { Form, TextArea, TextInput } from '@onefootprint/ui';
import React, { useId } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import IdentifierInput from './components/identifier-input/identifier-input';

type CustomDocRequestFormProps = {
  customDocNameFormField: string;
  customDocIdentifierFormField: string;
  customDocDescriptionFormField: string;
  disabled?: boolean;
};

const CustomDocRequestForm = ({
  customDocNameFormField,
  customDocIdentifierFormField,
  customDocDescriptionFormField,
  disabled,
}: CustomDocRequestFormProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.custom-doc-request-form',
  });
  const { register, getFieldState } = useFormContext();
  const id = useId();
  const nameFieldState = getFieldState(customDocNameFormField);

  return (
    <>
      <Form.Field>
        <Form.Label
          htmlFor={`document-name-${id}`}
          tooltip={{ text: t('document-name.tooltip') }}
        >
          {t('document-name.label')}
        </Form.Label>
        <TextInput
          disabled={disabled}
          hasError={!!nameFieldState.error}
          id={`document-name-${id}`}
          placeholder={t('document-name.placeholder')}
          {...register(customDocNameFormField, {
            required: t('document-name.errors.required'),
          })}
        />
        <Form.Errors>{nameFieldState.error?.message}</Form.Errors>
      </Form.Field>
      <IdentifierInput
        customDocIdentifierFormField={customDocIdentifierFormField}
        disabled={disabled}
      />
      <Form.Field>
        <Form.Label
          htmlFor={`document-description-${id}`}
          tooltip={{ text: t('document-description.tooltip') }}
        >
          {t('document-description.label')}
        </Form.Label>
        <TextArea
          id={`document-description-${id}`}
          disabled={disabled}
          {...register(customDocDescriptionFormField)}
        />
      </Form.Field>
    </>
  );
};

export default CustomDocRequestForm;
