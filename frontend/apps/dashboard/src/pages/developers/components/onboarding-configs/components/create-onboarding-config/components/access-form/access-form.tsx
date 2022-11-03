import { useTranslation } from '@onefootprint/hooks';
import { CollectedKycDataOption } from '@onefootprint/types';
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
    kycData: Map<CollectedKycDataOption, boolean>;
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
        {kycData.has(CollectedKycDataOption.phoneNumber) && (
          <Checkbox
            label={allT('collected-kyc-data-options.phone_number')}
            {...register(`kycData.${CollectedKycDataOption.phoneNumber}`)}
          />
        )}
        {kycData.has(CollectedKycDataOption.email) && (
          <Checkbox
            label={allT('collected-kyc-data-options.email')}
            {...register(`kycData.${CollectedKycDataOption.email}`)}
          />
        )}
        {kycData.has(CollectedKycDataOption.name) && (
          <Checkbox
            label={allT('collected-kyc-data-options.name')}
            {...register(`kycData.${CollectedKycDataOption.name}`)}
          />
        )}
        {kycData.has(CollectedKycDataOption.dob) && (
          <Checkbox
            label={allT('collected-kyc-data-options.dob')}
            {...register(`kycData.${CollectedKycDataOption.dob}`)}
          />
        )}
        {kycData.has(CollectedKycDataOption.ssn9) && (
          <Checkbox
            label={allT('collected-kyc-data-options.ssn9')}
            {...register(`kycData.${CollectedKycDataOption.ssn9}`)}
          />
        )}
        {kycData.has(CollectedKycDataOption.ssn4) && (
          <Checkbox
            label={allT('collected-kyc-data-options.ssn4')}
            {...register(`kycData.${CollectedKycDataOption.ssn4}`)}
          />
        )}
        {/* TODO: https://linear.app/footprint/issue/FP-1607/improve-toggle-react-hook-form-integration */}
        {kycData.has(CollectedKycDataOption.fullAddress) && (
          <Checkbox
            label={allT('collected-kyc-data-options.full_address')}
            {...register(`kycData.${CollectedKycDataOption.fullAddress}`)}
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
    gap: ${theme.spacing[3]};
  `}
`;

export default AccessForm;
