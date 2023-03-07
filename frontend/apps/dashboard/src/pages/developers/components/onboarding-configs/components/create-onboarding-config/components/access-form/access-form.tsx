import { useTranslation } from '@onefootprint/hooks';
import { CollectedKycDataOption } from '@onefootprint/types';
import { Box, Checkbox } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import type {
  DocumentsFormData,
  KycDataFormData,
} from '../../create-onboarding-config.types';
import AnimatedContainer from '../animated-container/animated-container';
import FormTitle from '../form-title';

export type AccessFormData = {
  kycData: KycDataFormData;
  documents: DocumentsFormData;
};

type AccessFormProps = {
  defaultValues: AccessFormData;
  fields: {
    kycData: Map<CollectedKycDataOption, boolean>;
    documents: {
      idDoc: boolean;
      selfie?: boolean;
    };
  };
  onSubmit: (formData: AccessFormData) => void;
};

type FormData = {
  kycData: KycDataFormData;
  documents: DocumentsFormData & {
    showSelfie: boolean;
  };
};

const AccessForm = ({
  defaultValues,
  onSubmit,
  fields: { kycData, documents },
}: AccessFormProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create',
  );
  const defaultKycData = defaultValues?.kycData;
  const defaultDocumentData = defaultValues?.documents;
  const [innerFields, setInnerFields] = useState({
    idDoc: !!defaultDocumentData.idDoc,
  });
  const { setValue, register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      kycData: defaultKycData,
      documents: {
        ...defaultDocumentData,
      },
    },
  });
  const handleIdDocChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setInnerFields(prevState => ({ ...prevState, idDoc: checked }));
    setValue('documents.showSelfie', checked);
  };
  const isSelfieShown = innerFields.idDoc && !!defaultDocumentData.selfie;

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
            label={allT('collected-data-options.phone_number')}
            {...register(`kycData.${CollectedKycDataOption.phoneNumber}`)}
          />
        )}
        {kycData.has(CollectedKycDataOption.email) && (
          <Checkbox
            label={allT('collected-data-options.email')}
            {...register(`kycData.${CollectedKycDataOption.email}`)}
          />
        )}
        {kycData.has(CollectedKycDataOption.name) && (
          <Checkbox
            label={allT('collected-data-options.name')}
            {...register(`kycData.${CollectedKycDataOption.name}`)}
          />
        )}
        {kycData.has(CollectedKycDataOption.dob) && (
          <Checkbox
            label={allT('collected-data-options.dob')}
            {...register(`kycData.${CollectedKycDataOption.dob}`)}
          />
        )}
        {kycData.has(CollectedKycDataOption.ssn9) && (
          <Checkbox
            label={allT('collected-data-options.ssn9')}
            {...register(`kycData.${CollectedKycDataOption.ssn9}`)}
          />
        )}
        {kycData.has(CollectedKycDataOption.ssn4) && (
          <Checkbox
            label={allT('collected-data-options.ssn4')}
            {...register(`kycData.${CollectedKycDataOption.ssn4}`)}
          />
        )}
        {/* TODO: https://linear.app/footprint/issue/FP-1607/improve-toggle-react-hook-form-integration */}
        {kycData.has(CollectedKycDataOption.fullAddress) && (
          <Checkbox
            label={allT('collected-data-options.full_address')}
            {...register(`kycData.${CollectedKycDataOption.fullAddress}`)}
          />
        )}
        <Box>
          {documents.idDoc && (
            <Checkbox
              label={allT('collected-data-options.document')}
              {...register(`documents.idDoc`)}
              onChange={handleIdDocChange}
            />
          )}
          <AnimatedContainer isExpanded={isSelfieShown}>
            <Checkbox
              label={allT('id-doc-type.selfie')}
              {...register(`documents.selfie`)}
            />
          </AnimatedContainer>
        </Box>
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
