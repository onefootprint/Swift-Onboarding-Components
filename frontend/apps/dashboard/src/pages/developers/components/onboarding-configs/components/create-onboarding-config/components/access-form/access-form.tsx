import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataOption } from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import type {
  IdDocFormData,
  KycDataFormData,
} from '../../create-onboarding-config.types';
import FormTitle from '../form-title';

export type AccessFormData = {
  kycData: KycDataFormData;
  idDoc: IdDocFormData;
};

type AccessFormProps = {
  defaultValues?: AccessFormData;
  fields: {
    kycData: Map<CollectedDataOption, boolean>;
    idDoc: boolean;
  };
  onSubmit: (formData: AccessFormData) => void;
};

const AccessForm = ({
  defaultValues,
  onSubmit,
  fields: { kycData, idDoc },
}: AccessFormProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create',
  );
  const { register, handleSubmit } = useForm<AccessFormData>({ defaultValues });

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
        {kycData.has(CollectedDataOption.phoneNumber) && (
          <Checkbox
            label={allT('collected-data-options.phone_number')}
            {...register(`kycData.${CollectedDataOption.phoneNumber}`)}
          />
        )}
        {kycData.has(CollectedDataOption.email) && (
          <Checkbox
            label={allT('collected-data-options.email')}
            {...register(`kycData.${CollectedDataOption.email}`)}
          />
        )}
        {kycData.has(CollectedDataOption.name) && (
          <Checkbox
            label={allT('collected-data-options.name')}
            {...register(`kycData.${CollectedDataOption.name}`)}
          />
        )}
        {kycData.has(CollectedDataOption.dob) && (
          <Checkbox
            label={allT('collected-data-options.dob')}
            {...register(`kycData.${CollectedDataOption.dob}`)}
          />
        )}
        {kycData.has(CollectedDataOption.ssn9) && (
          <Checkbox
            label={allT('collected-data-options.ssn9')}
            {...register(`kycData.${CollectedDataOption.ssn9}`)}
          />
        )}
        {kycData.has(CollectedDataOption.ssn4) && (
          <Checkbox
            label={allT('collected-data-options.ssn4')}
            {...register(`kycData.${CollectedDataOption.ssn4}`)}
          />
        )}
        {/* TODO: https://linear.app/footprint/issue/FP-1607/improve-toggle-react-hook-form-integration */}
        {kycData.has(CollectedDataOption.fullAddress) && (
          <Checkbox
            label={allT('collected-data-options.full_address')}
            {...register(`kycData.${CollectedDataOption.fullAddress}`)}
          />
        )}
        {idDoc && (
          <Checkbox
            label={allT('collected-id-doc-attributes.id-doc-image')}
            {...register(`idDoc.idDoc`)}
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
