import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataOption } from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import type { DataKindForm } from '../../create-onboarding-config.types';
import FormTitle from '../form-title';

type FormData = DataKindForm;

type AccessFormProps = {
  defaultValues?: DataKindForm;
  fields: Map<string, boolean>;
  onSubmit: (formData: DataKindForm) => void;
};

const AccessForm = ({ defaultValues, onSubmit, fields }: AccessFormProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create',
  );
  const { register, handleSubmit } = useForm<FormData>({ defaultValues });
  return (
    <form
      id="access-form"
      data-testid="access-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormTitle
        title={t('access-form.title')}
        description={t('access-form.description')}
      />
      <CheckboxContainer>
        {fields.has(CollectedDataOption.phoneNumber) && (
          <Checkbox
            label={allT('collected-data-options.phone_number')}
            {...register(CollectedDataOption.phoneNumber)}
          />
        )}
        {fields.has(CollectedDataOption.email) && (
          <Checkbox
            label={allT('collected-data-options.email')}
            {...register(CollectedDataOption.email)}
          />
        )}
        {fields.has(CollectedDataOption.name) && (
          <Checkbox
            label={allT('collected-data-options.name')}
            {...register(CollectedDataOption.name)}
          />
        )}
        {fields.has(CollectedDataOption.dob) && (
          <Checkbox
            label={allT('collected-data-options.dob')}
            {...register(CollectedDataOption.dob)}
          />
        )}
        {fields.has(CollectedDataOption.ssn9) && (
          <Checkbox
            label={allT('collected-data-options.ssn9')}
            {...register(CollectedDataOption.ssn9)}
          />
        )}
        {fields.has(CollectedDataOption.ssn4) && (
          <Checkbox
            label={allT('collected-data-options.ssn4')}
            {...register(CollectedDataOption.ssn4)}
          />
        )}
        {fields.has(CollectedDataOption.fullAddress) && (
          <Checkbox
            label={allT('collected-data-options.full_address')}
            {...register(CollectedDataOption.fullAddress)}
          />
        )}
        {fields.has(CollectedDataOption.partialAddress) && (
          <Checkbox
            label={allT('collected-data-options.partial_address')}
            {...register(CollectedDataOption.partialAddress)}
          />
        )}
      </CheckboxContainer>
    </form>
  );
};

const CheckboxContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]}px;
  `}
`;

export default AccessForm;
