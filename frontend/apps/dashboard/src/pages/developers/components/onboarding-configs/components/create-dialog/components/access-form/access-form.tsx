import { useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import { DataKinds } from 'src/types/data-kind';
import styled, { css } from 'styled-components';
import { Box, Checkbox, Typography } from 'ui';

import DEFAULT_FORM_VALUES from '../../create-dialog.constants';
import type { AccessFormData } from '../../types';
import FormTitle from '../form-title';

type FormData = AccessFormData & {
  all: boolean;
};

type AccessFormProps = {
  onSubmit: (formData: AccessFormData) => void;
  fields: Map<string, boolean>;
};

const AccessForm = ({ onSubmit, fields }: AccessFormProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create',
  );
  const { setValue, register, handleSubmit } = useForm<FormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const handleChangeAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setValue('name', checked);
    setValue(DataKinds.city, checked);
    setValue(DataKinds.country, checked);
    setValue(DataKinds.dob, checked);
    setValue(DataKinds.email, checked);
    setValue(DataKinds.lastFourSsn, checked);
    setValue(DataKinds.phoneNumber, checked);
    setValue(DataKinds.ssn, checked);
    setValue(DataKinds.state, checked);
    setValue(DataKinds.streetAddress, checked);
    setValue(DataKinds.streetAddress2, checked);
    setValue(DataKinds.zip, checked);
  };

  // TODO: MOVE
  const shouldRender = (foo: string[]) => foo.some(field => fields.get(field));
  const shouldRenderBasicData = shouldRender([
    'name',
    DataKinds.email,
    DataKinds.phoneNumber,
  ]);
  const shouldRenderIdentityData = shouldRender([
    DataKinds.ssn,
    DataKinds.lastFourSsn,
    DataKinds.dob,
  ]);
  const shouldRenderAddress = shouldRender([
    DataKinds.country,
    DataKinds.streetAddress,
    DataKinds.streetAddress2,
    DataKinds.city,
    DataKinds.zip,
    DataKinds.state,
  ]);

  const handleBeforeSubmit = (formData: FormData) => {
    // TODO: Adjust this
    onSubmit({
      name: fields.has('name') && formData.name,
      [DataKinds.email]:
        fields.has(DataKinds.email) && formData[DataKinds.email],
      [DataKinds.phoneNumber]:
        fields.has(DataKinds.phoneNumber) && formData[DataKinds.phoneNumber],
      [DataKinds.ssn]: fields.has(DataKinds.ssn) && formData[DataKinds.ssn],
      [DataKinds.lastFourSsn]:
        fields.has(DataKinds.lastFourSsn) && formData[DataKinds.lastFourSsn],
      [DataKinds.dob]: fields.has(DataKinds.dob) && formData[DataKinds.dob],
      [DataKinds.country]:
        fields.has(DataKinds.country) && formData[DataKinds.country],
      [DataKinds.streetAddress]:
        fields.has(DataKinds.streetAddress) &&
        formData[DataKinds.streetAddress],
      [DataKinds.streetAddress2]:
        fields.has(DataKinds.streetAddress2) &&
        formData[DataKinds.streetAddress2],
      [DataKinds.city]: fields.has(DataKinds.city) && formData[DataKinds.city],
      [DataKinds.zip]: fields.has(DataKinds.zip) && formData[DataKinds.zip],
      [DataKinds.state]:
        fields.has(DataKinds.state) && formData[DataKinds.state],
    });
  };

  return (
    <form
      id="access-form"
      data-testid="access-form"
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      <FormTitle
        title={t('access-form.title')}
        description={t('access-form.description')}
      />
      {fields.size > 1 && (
        <Box sx={{ marginBottom: 6 }}>
          <Checkbox
            label="All"
            {...register('all')}
            onChange={handleChangeAll}
          />
        </Box>
      )}
      <Grid>
        <Box>
          {shouldRenderBasicData && (
            <Fieldset>
              <Typography variant="label-3" as="h3">
                {t('sections.basic-data')}
              </Typography>
              {fields.has('name') && (
                <Checkbox
                  label={allT('data-kinds.name')}
                  {...register('name')}
                />
              )}
              {fields.has(DataKinds.email) && (
                <Checkbox
                  label={allT('data-kinds.email')}
                  {...register(DataKinds.email)}
                />
              )}
              {fields.has(DataKinds.phoneNumber) && (
                <Checkbox
                  label={allT('data-kinds.phone_number')}
                  {...register(DataKinds.phoneNumber)}
                />
              )}
            </Fieldset>
          )}
          {shouldRenderIdentityData && (
            <Fieldset>
              <Typography variant="label-3" as="h3">
                {t('sections.identity-data')}
              </Typography>
              {fields.has(DataKinds.ssn) && (
                <Checkbox
                  label={allT('data-kinds.ssn')}
                  {...register(DataKinds.ssn)}
                />
              )}
              {fields.has(DataKinds.lastFourSsn) && (
                <Checkbox
                  label={allT('data-kinds.last_four_ssn')}
                  {...register(DataKinds.lastFourSsn)}
                />
              )}
              {fields.has(DataKinds.dob) && (
                <Checkbox
                  label={allT('data-kinds.dob')}
                  {...register(DataKinds.dob)}
                />
              )}
            </Fieldset>
          )}
        </Box>
        <Box>
          {shouldRenderAddress && (
            <Fieldset>
              <Typography variant="label-3" as="h3">
                {t('sections.address')}
              </Typography>
              {fields.has(DataKinds.country) && (
                <Checkbox
                  label={allT('data-kinds.country')}
                  {...register(DataKinds.country)}
                />
              )}
              {fields.has(DataKinds.streetAddress) && (
                <Checkbox
                  label={allT('data-kinds.street_address')}
                  {...register(DataKinds.streetAddress)}
                />
              )}
              {fields.has(DataKinds.streetAddress2) && (
                <Checkbox
                  label={allT('data-kinds.street_address2')}
                  {...register(DataKinds.streetAddress2)}
                />
              )}
              {fields.has(DataKinds.city) && (
                <Checkbox
                  label={allT('data-kinds.city')}
                  {...register(DataKinds.city)}
                />
              )}
              {fields.has(DataKinds.zip) && (
                <Checkbox
                  label={allT('data-kinds.zip')}
                  {...register(DataKinds.zip)}
                />
              )}
              {fields.has(DataKinds.state) && (
                <Checkbox
                  label={allT('data-kinds.state')}
                  {...register(DataKinds.state)}
                />
              )}
            </Fieldset>
          )}
        </Box>
      </Grid>
    </form>
  );
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`;

const Fieldset = styled.fieldset`
  ${({ theme }) => css`
    &:not(:last-child) {
      margin-bottom: ${theme.spacing[7]}px;
    }

    h3 {
      margin-bottom: ${theme.spacing[5]}px;
    }
  `}
`;

export default AccessForm;
