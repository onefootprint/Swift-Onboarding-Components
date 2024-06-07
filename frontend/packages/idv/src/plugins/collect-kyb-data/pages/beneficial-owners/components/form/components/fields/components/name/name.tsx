import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { TextInput, media } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { FormData } from '../../../../types';

type NameProps = {
  index: number;
};

const Name = ({ index }: NameProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.beneficial-owners.form.fields',
  });
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();

  const firstNameErrors = errors.beneficialOwners?.[index]?.[BeneficialOwnerDataAttribute.firstName];
  const hasFirstNameError = !!firstNameErrors;

  const lastNameErrors = errors.beneficialOwners?.[index]?.[BeneficialOwnerDataAttribute.lastName];
  const hasLastNameError = !!lastNameErrors;

  return (
    <>
      <Row columns={2}>
        <TextInput
          autoFocus
          data-private
          data-dd-privacy="mask"
          hasError={hasFirstNameError}
          hint={hasFirstNameError ? t('first-name.error') : undefined}
          label={t('first-name.label')}
          placeholder={t('first-name.placeholder')}
          {...register(`beneficialOwners.${index}.${BeneficialOwnerDataAttribute.firstName}`, { required: true })}
        />

        <TextInput
          data-private
          data-dd-privacy="mask"
          label={t('middle-name.label')}
          placeholder={t('middle-name.placeholder')}
          {...register(`beneficialOwners.${index}.${BeneficialOwnerDataAttribute.middleName}`)}
        />
      </Row>
      <Row columns={1}>
        <TextInput
          data-private
          data-dd-privacy="mask"
          hasError={hasLastNameError}
          hint={hasLastNameError ? t('last-name.error') : undefined}
          label={t('last-name.label')}
          placeholder={t('last-name.placeholder')}
          {...register(`beneficialOwners.${index}.${BeneficialOwnerDataAttribute.lastName}`, { required: true })}
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

export default Name;
