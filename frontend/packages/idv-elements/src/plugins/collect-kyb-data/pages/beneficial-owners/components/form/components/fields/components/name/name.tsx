import { useTranslation } from '@onefootprint/hooks';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { Grid, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { FormData } from '../../../../types';

type NameProps = {
  index: number;
};

const Name = ({ index }: NameProps) => {
  const { t } = useTranslation('pages.beneficial-owners.form.fields');
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();

  const firstNameErrors =
    errors.beneficialOwners?.[index]?.[BeneficialOwnerDataAttribute.firstName];
  const hasFirstNameError = !!firstNameErrors;

  const lastNameErrors =
    errors.beneficialOwners?.[index]?.[BeneficialOwnerDataAttribute.lastName];
  const hasLastNameError = !!lastNameErrors;

  return (
    <>
      <Grid.Row>
        <Grid.Column col={12}>
          <TextInput
            data-private
            hasError={hasFirstNameError}
            hint={hasFirstNameError ? t('first-name.error') : undefined}
            label={t('first-name.label')}
            placeholder={t('first-name.placeholder')}
            {...register(
              `beneficialOwners.${index}.${BeneficialOwnerDataAttribute.firstName}`,
              { required: true },
            )}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column col={12}>
          <TextInput
            data-private
            label={t('middle-name.label')}
            placeholder={t('middle-name.placeholder')}
            {...register(
              `beneficialOwners.${index}.${BeneficialOwnerDataAttribute.middleName}`,
            )}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column col={12}>
          <TextInput
            data-private
            hasError={hasLastNameError}
            hint={hasLastNameError ? t('last-name.error') : undefined}
            label={t('last-name.label')}
            placeholder={t('last-name.placeholder')}
            {...register(
              `beneficialOwners.${index}.${BeneficialOwnerDataAttribute.lastName}`,
              { required: true },
            )}
          />
        </Grid.Column>
      </Grid.Row>
    </>
  );
};

export default Name;
