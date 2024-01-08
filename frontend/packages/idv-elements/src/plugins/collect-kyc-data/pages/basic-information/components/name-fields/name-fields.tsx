import { useTranslation } from '@onefootprint/hooks';
import { media, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

import validateName, { NameValidationError } from './validate-name';

type NameFieldsProps = {
  disabled?: boolean;
};

const NameFields = ({ disabled }: NameFieldsProps) => {
  const { t } = useTranslation('pages.kyc.basic-information.form');
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  const getFirstNameHint = () => {
    if (!errors.firstName) {
      return undefined;
    }
    const { message } = errors.firstName;
    if (message && typeof message === 'string') {
      return message;
    }
    const validationError = validateName(getValues('firstName'));
    if (validationError === NameValidationError.EMPTY) {
      return t('first-name.error.empty');
    }
    if (validationError === NameValidationError.SPECIAL_CHARS) {
      return t('first-name.error.special-chars');
    }
    return undefined;
  };

  const getMiddleNameHint = () => {
    if (!errors.middleName) {
      return undefined;
    }
    const { message } = errors.middleName;
    if (message && typeof message === 'string') {
      return message;
    }
    const validationError = validateName(getValues('middleName'));
    if (validationError === NameValidationError.SPECIAL_CHARS) {
      return t('middle-name.error.special-chars');
    }
    return undefined;
  };

  const getLastNameHint = () => {
    if (!errors.lastName) {
      return undefined;
    }
    const { message } = errors.lastName;
    if (message && typeof message === 'string') {
      return message;
    }
    const validationError = validateName(getValues('lastName'));
    if (validationError === NameValidationError.EMPTY) {
      return t('last-name.error.empty');
    }
    if (validationError === NameValidationError.SPECIAL_CHARS) {
      return t('last-name.error.special-chars');
    }
    return undefined;
  };

  return (
    <>
      <Row columns={2}>
        <TextInput
          autoFocus
          data-private
          disabled={disabled}
          hasError={!!errors.firstName}
          hint={getFirstNameHint()}
          label={t('first-name.label')}
          placeholder={t('first-name.placeholder')}
          {...register('firstName', {
            required: true,
            validate: (value: string) => validateName(value) === undefined,
          })}
        />
        <TextInput
          data-private
          disabled={disabled}
          hasError={!!errors.middleName}
          hint={getMiddleNameHint()}
          label={t('middle-name.label')}
          placeholder={t('middle-name.placeholder')}
          {...register('middleName', {
            validate: (value: string) =>
              validateName(value) !== NameValidationError.SPECIAL_CHARS,
          })}
        />
      </Row>
      <Row columns={1}>
        <TextInput
          data-private
          disabled={disabled}
          hasError={!!errors.lastName}
          hint={getLastNameHint()}
          label={t('last-name.label')}
          placeholder={t('last-name.placeholder')}
          {...register('lastName', {
            required: true,
            validate: (value: string) => validateName(value) === undefined,
          })}
        />
      </Row>
    </>
  );
};

const Row = styled.div<{ columns: number }>`
  ${({ columns, theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};

    ${media.greaterThan('md')`
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: ${theme.spacing[4]};
    `}
  `}
`;

export default NameFields;
