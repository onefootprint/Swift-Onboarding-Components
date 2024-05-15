import { IcoInfo16 } from '@onefootprint/icons';
import { Stack, Text, TextArea, TextInput, Tooltip } from '@onefootprint/ui';
import React from 'react';
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

  const nameFieldState = getFieldState(customDocNameFormField);

  return (
    <>
      <Stack direction="column" gap={3}>
        <Stack direction="row" gap={2} alignItems="center">
          <label htmlFor="custom-doc-name-form-field">
            <Text variant="label-4">{t('document-name.label')}</Text>
          </label>
          <Tooltip text={t('document-name.tooltip')}>
            <IcoInfo16 color="tertiary" />
          </Tooltip>
        </Stack>
        <TextInput
          placeholder={t('document-name.placeholder')}
          hasError={!!nameFieldState.error}
          id="custom-doc-name-form-field"
          hint={nameFieldState.error && t('document-name.errors.required')}
          disabled={disabled}
          {...register(customDocNameFormField, { required: true })}
        />
      </Stack>
      <IdentifierInput
        customDocIdentifierFormField={customDocIdentifierFormField}
        disabled={disabled}
      />
      <Stack direction="column" gap={3}>
        <Stack direction="row" gap={2} alignItems="center">
          <label htmlFor="custom-doc-description-form-field">
            <Text variant="label-4">{t('document-description.label')}</Text>
          </label>
          <Tooltip text={t('document-description.tooltip')}>
            <IcoInfo16 color="tertiary" />
          </Tooltip>
        </Stack>
        <TextArea
          id="custom-doc-description-form-field"
          disabled={disabled}
          {...register(customDocDescriptionFormField, {
            required: false,
          })}
        />
      </Stack>
    </>
  );
};

export default CustomDocRequestForm;
