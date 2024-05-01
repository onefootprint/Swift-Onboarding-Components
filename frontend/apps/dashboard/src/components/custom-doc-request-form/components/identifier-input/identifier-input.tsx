import { IcoInfo16 } from '@onefootprint/icons';
import { Stack, Text, TextInput, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type IdentifierInputProps = {
  customDocIdentifierFormField: string;
  disabled?: boolean;
};

const IDENTIFIER_PREFIX = 'document.custom.';

const IdentifierInput = ({
  customDocIdentifierFormField,
  disabled,
}: IdentifierInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.custom-doc-request-form.document-identifier',
  });
  const {
    register,
    formState: { errors, isSubmitted },
    setValue,
  } = useFormContext();

  const getIdentifierError = (value?: string) => {
    if (!value) return t('errors.required');
    const sanitizedValue = value.replace(IDENTIFIER_PREFIX, '');
    if (sanitizedValue.length === 0) return t('errors.required');
    if (!sanitizedValue.match(/^[A-Za-z0-9_-]+$/))
      return t('errors.no-special-characters');
    return undefined;
  };

  register(customDocIdentifierFormField, {
    validate: getIdentifierError,
  });
  const handleChangeIdentifier = (value: string) => {
    setValue(customDocIdentifierFormField, `${IDENTIFIER_PREFIX}${value}`, {
      shouldValidate: isSubmitted,
    });
  };

  return (
    <Stack direction="column" gap={3}>
      <Stack direction="row" gap={2} alignItems="center">
        <label htmlFor="custom-doc-identifier-form-field">
          <Text variant="label-4">{t('label')}</Text>
        </label>
        <Tooltip text={t('tooltip')}>
          <IcoInfo16 color="tertiary" />
        </Tooltip>
      </Stack>
      <Input
        placeholder=""
        id="custom-doc-identifier-form-field"
        hasError={!!errors[customDocIdentifierFormField]}
        prefixComponent={
          <IdentifierPrefix>
            <Text variant="body-4">{IDENTIFIER_PREFIX}</Text>
          </IdentifierPrefix>
        }
        hint={errors?.[customDocIdentifierFormField]?.message as string}
        disabled={disabled}
        onChangeText={handleChangeIdentifier}
      />
    </Stack>
  );
};

const IdentifierPrefix = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    height: 100%;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    border-top-left-radius: ${theme.borderRadius.default};
    border-bottom-left-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.secondary};
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
  `};
`;

const Input = styled(TextInput)`
  ${({ theme }) => css`
    padding-left: calc(${theme.spacing[13]} + ${theme.spacing[5]});
  `};
`;

export default IdentifierInput;
