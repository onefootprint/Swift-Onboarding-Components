import { useTranslation } from '@onefootprint/hooks';
import { CollectedKycDataOption, UserDataAttribute } from '@onefootprint/types';
import { Box, Checkbox, Radio, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trans } from 'react-i18next';
import styled, { css } from 'styled-components';

import type {
  DocumentsFormData,
  KycDataFormData,
} from '../../create-onboarding-config.types';
import AnimatedContainer from '../animated-container';
import FormTitle from '../form-title';

export type CollectFormData = {
  kycData: KycDataFormData;
  documents: DocumentsFormData;
};

type FormData = {
  kycData: KycDataFormData & {
    showSSNOptions: boolean;
    // TODO: these could be CollectedKycDataOptions instead of UserDataAttributes
    ssnKind?: UserDataAttribute.ssn4 | UserDataAttribute.ssn9;
  };
  documents: DocumentsFormData;
};

type CollectFormProps = {
  defaultValues: CollectFormData;
  onSubmit: (formData: CollectFormData) => void;
};

const CollectForm = ({ defaultValues, onSubmit }: CollectFormProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create.collect-form',
  );
  const defaultKycData = defaultValues.kycData;
  const [innerFields, setInnerFields] = useState({
    ssn: defaultKycData.ssn4 || defaultKycData.ssn9,
    address: defaultKycData.full_address || defaultKycData.partial_address,
  });

  const getInitialSSNKind = () => {
    if (defaultKycData.ssn9) {
      return UserDataAttribute.ssn9;
    }
    if (defaultKycData.ssn4) {
      return UserDataAttribute.ssn4;
    }
    return undefined;
  };

  const { setValue, register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      ...defaultValues,
      kycData: {
        ...defaultKycData,
        showSSNOptions: innerFields.ssn,
        ssnKind: getInitialSSNKind(),
      },
    },
  });
  const idDoc = watch('documents.idDoc');

  const handleSSNKindsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setInnerFields(prevState => ({ ...prevState, ssn: checked }));
    setValue('kycData.ssnKind', checked ? UserDataAttribute.ssn9 : undefined);
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const { kycData, documents } = formData;
    const submittedData = {
      kycData: {
        [CollectedKycDataOption.email]: true,
        [CollectedKycDataOption.phoneNumber]: true,
        [CollectedKycDataOption.name]: true,
        [CollectedKycDataOption.fullAddress]: true,
        [CollectedKycDataOption.dob]: kycData[CollectedKycDataOption.dob],
        [UserDataAttribute.ssn4]: kycData.ssnKind === UserDataAttribute.ssn4,
        [UserDataAttribute.ssn9]: kycData.ssnKind === UserDataAttribute.ssn9,
      },
      documents: {
        idDoc: documents.idDoc,
        selfie: documents.selfie,
      },
    };
    onSubmit(submittedData);
  };

  return (
    <form
      data-testid="collect-form"
      id="collect-form"
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      <FormTitle
        description={t('collected-data.description')}
        title={t('collected-data.title')}
      />
      <CheckboxContainer>
        <Checkbox
          label={allT('collected-kyc-data-options.phone_number')}
          disabled
          checked
        />
        <Checkbox
          label={allT('collected-kyc-data-options.email')}
          disabled
          checked
        />
        <Checkbox
          label={allT('collected-kyc-data-options.name')}
          disabled
          checked
        />
        <Checkbox
          label={allT('collected-kyc-data-options.dob')}
          {...register(`kycData.${UserDataAttribute.dob}`)}
        />
        <Box>
          <Checkbox
            label={t('collected-data.ssn')}
            {...register('kycData.showSSNOptions')}
            onChange={handleSSNKindsChange}
          />
          <AnimatedContainer isExpanded={!!innerFields.ssn}>
            <Radio
              value={UserDataAttribute.ssn9}
              label={t('collected-data.ssn_full')}
              {...register('kycData.ssnKind')}
            />
            <Radio
              value={UserDataAttribute.ssn4}
              label={t('collected-data.ssn_last_4')}
              {...register('kycData.ssnKind')}
            />
          </AnimatedContainer>
        </Box>
        {/* TODO: https://linear.app/footprint/issue/FP-1696/relax-the-constraints-on-dashboard-onboarding-config-creation-collect */}
        <Box>
          <Checkbox label={t('collected-data.address')} disabled checked />
        </Box>
        <Box>
          <Checkbox
            label={t('documents.id-doc')}
            {...register(`documents.idDoc`)}
          />
          {!idDoc && (
            <IdDocDescription>
              <Typography variant="body-3" color="tertiary">
                <Trans
                  i18nKey="pages.developers.onboarding-configs.create.collect-form.documents.id-doc-description"
                  components={{
                    a: (
                      <Link
                        href="http://www.onefootprint.com/supported-id-documents"
                        rel="noopener noreferrer"
                        target="_blank"
                      />
                    ),
                  }}
                />
              </Typography>
            </IdDocDescription>
          )}
          <AnimatedContainer isExpanded={idDoc}>
            <Checkbox
              label={t('documents.selfie')}
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

const IdDocDescription = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[2]};
    margin-left: calc(${theme.spacing[2]} + ${theme.spacing[7]});
  `}
`;

export default CollectForm;
