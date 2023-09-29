import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

import validateName, { NameValidationError } from './validate-name';

type NameFieldsProps = {
  disabled?: boolean;
};

const NameFields = ({ disabled }: NameFieldsProps) => {
  const { t } = useTranslation('pages.basic-information.form');
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  const getFirstNameHint = () => {
    if (!errors.firstName) {
      return undefined;
    }
    const validationError = validateName(getValues('firstName'));
    if (validationError === NameValidationError.EMPTY) {
      return t('first-name.error.empty');
    }
    if (validationError === NameValidationError.SPECIAL_CHARS) {
      return t('first-name.error.special-chars');
    }
    return t('first-name.error.invalid');
  };

  const getLastNameHint = () => {
    if (!errors.lastName) {
      return undefined;
    }
    const validationError = validateName(getValues('lastName'));
    if (validationError === NameValidationError.EMPTY) {
      return t('last-name.error.empty');
    }
    if (validationError === NameValidationError.SPECIAL_CHARS) {
      return t('last-name.error.special-chars');
    }
    return t('last-name.error.invalid');
  };

  return (
    <>
      <Row columns={2}>
        <TextInput
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
          label={t('middle-name.label')}
          placeholder={t('middle-name.placeholder')}
          {...register('middleName')}
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
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    gap: ${theme.spacing[4]};
  `}
`;

export default NameFields;
