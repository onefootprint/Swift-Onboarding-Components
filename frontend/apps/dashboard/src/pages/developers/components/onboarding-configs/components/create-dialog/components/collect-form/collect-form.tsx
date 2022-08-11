import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from 'hooks';
import identity from 'lodash/identity';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DataKinds } from 'src/types/data-kind';
import styled, { css } from 'styled-components';
import { Box, Checkbox, RadioInput, Typography } from 'ui';

import DEFAULT_FORM_VALUES from '../../create-dialog.constants';
import type { CollectFormData } from '../../types';
import FormTitle from '../form-title';

type FormData = CollectFormData & {
  all: boolean;
  showSSNOptions: boolean;
  ssnKind: DataKinds.lastFourSsn | DataKinds.ssn | '';
};

type CollectFormProps = {
  onSubmit: (formData: CollectFormData) => void;
};

const CollectForm = ({ onSubmit }: CollectFormProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create',
  );
  const [animateSSN] = useAutoAnimate<HTMLDivElement>();
  const [showSSNKinds, setShowSSNKinds] = useState(true);

  const {
    setValue,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      ...DEFAULT_FORM_VALUES,
      showSSNOptions: true,
      ssnKind: DataKinds.ssn,
    },
  });

  const handleChangeAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    handleSSNKindsChange(event);
    setValue('name', checked);
    setValue('showSSNOptions', checked);
    setValue(DataKinds.city, checked);
    setValue(DataKinds.country, checked);
    setValue(DataKinds.dob, checked);
    setValue(DataKinds.email, checked);
    setValue(DataKinds.phoneNumber, checked);
    setValue(DataKinds.state, checked);
    setValue(DataKinds.streetAddress, checked);
    setValue(DataKinds.streetAddress2, checked);
    setValue(DataKinds.zip, checked);
  };

  const handleSSNKindsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setShowSSNKinds(checked);
    setValue('ssnKind', checked ? DataKinds.ssn : '');
  };

  const handleValidate = () => {
    const isValid = getValues([
      'name',
      'ssnKind',
      DataKinds.city,
      DataKinds.country,
      DataKinds.dob,
      DataKinds.email,
      DataKinds.phoneNumber,
      DataKinds.state,
      DataKinds.streetAddress,
      DataKinds.streetAddress2,
      DataKinds.zip,
    ]).some(identity);
    return isValid || t('collect-form.error');
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const { all, showSSNOptions, ssnKind, ...rest } = formData;
    onSubmit({
      ...rest,
      [DataKinds.ssn]: ssnKind === DataKinds.ssn,
      [DataKinds.lastFourSsn]: ssnKind === DataKinds.lastFourSsn,
    });
  };

  return (
    <form
      data-testid="collect-form"
      id="collect-form"
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      <FormTitle
        description={t('collect-form.description')}
        error={errors.all?.message}
        title={t('collect-form.title')}
      />
      <Box sx={{ marginBottom: 6 }}>
        <Checkbox
          label="All"
          {...register('all', { validate: handleValidate })}
          onChange={handleChangeAll}
        />
      </Box>
      <Grid>
        <Box>
          <Fieldset>
            <Typography variant="label-3" as="h3">
              {t('sections.basic-data')}
            </Typography>
            <Checkbox label={allT('data-kinds.name')} {...register('name')} />
            <Checkbox
              label={allT('data-kinds.email')}
              {...register(DataKinds.email)}
            />
            <Checkbox
              label={allT('data-kinds.phone_number')}
              {...register(DataKinds.phoneNumber)}
            />
          </Fieldset>
          <Fieldset>
            <Typography variant="label-3" as="h3">
              {t('sections.identity-data')}
            </Typography>
            <Checkbox
              label={t('collect-form.ssn')}
              {...register('showSSNOptions')}
              onChange={handleSSNKindsChange}
            />
            <Box ref={animateSSN}>
              {showSSNKinds && (
                <Box sx={{ marginLeft: 5, marginBottom: 3 }}>
                  <RadioInput
                    value={DataKinds.ssn}
                    label={t('collect-form.ssn_full')}
                    {...register('ssnKind')}
                  />
                  <RadioInput
                    value={DataKinds.lastFourSsn}
                    label={t('collect-form.ssn_last_4')}
                    {...register('ssnKind')}
                  />
                </Box>
              )}
            </Box>
            <Checkbox
              label={allT('data-kinds.dob')}
              {...register(DataKinds.dob)}
            />
          </Fieldset>
        </Box>
        <Box>
          <Fieldset>
            <Typography variant="label-3" as="h3">
              {t('sections.address')}
            </Typography>
            <Checkbox
              label={allT('data-kinds.country')}
              {...register(DataKinds.country)}
            />
            <Checkbox
              label={allT('data-kinds.street_address')}
              {...register(DataKinds.streetAddress)}
            />
            <Checkbox
              label={allT('data-kinds.street_address2')}
              {...register(DataKinds.streetAddress2)}
            />
            <Checkbox
              label={allT('data-kinds.city')}
              {...register(DataKinds.city)}
            />
            <Checkbox
              label={allT('data-kinds.zip')}
              {...register(DataKinds.zip)}
            />
            <Checkbox
              label={allT('data-kinds.state')}
              {...register(DataKinds.state)}
            />
          </Fieldset>
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

export default CollectForm;
