import { useTranslation } from '@onefootprint/hooks';
import { CollectedKycDataOption, UserDataAttribute } from '@onefootprint/types';
import { Box, Checkbox, Divider, Radio, Toggle } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import type {
  IdDocFormData,
  KycDataFormData,
} from '../../create-onboarding-config.types';
import FormTitle from '../form-title';
import RadioGroupContainer from './components/radio-group-container';

export type CollectFormData = {
  kycData: KycDataFormData;
  idDoc: IdDocFormData;
};

type FormData = {
  kycData: KycDataFormData & {
    showSSNOptions: boolean;
    ssnKind?: UserDataAttribute.ssn4 | UserDataAttribute.ssn9;
  };
  idDoc: IdDocFormData;
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
  const defaultIdDocData = defaultValues.idDoc;
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

  const { setValue, register, handleSubmit, control } = useForm<FormData>({
    defaultValues: {
      kycData: {
        ...defaultKycData,
        showSSNOptions: innerFields.ssn,
        ssnKind: getInitialSSNKind(),
      },
      idDoc: {
        ...defaultIdDocData,
      },
    },
  });

  const handleSSNKindsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setInnerFields(prevState => ({ ...prevState, ssn: checked }));
    setValue('kycData.ssnKind', checked ? UserDataAttribute.ssn9 : undefined);
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const { kycData, idDoc } = formData;
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
      idDoc,
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
          <RadioGroupContainer isExpanded={!!innerFields.ssn}>
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
          </RadioGroupContainer>
        </Box>
        {/* TODO: https://linear.app/footprint/issue/FP-1696/relax-the-constraints-on-dashboard-onboarding-config-creation-collect */}
        <Box>
          <Checkbox label={t('collected-data.address')} disabled checked />
        </Box>
      </CheckboxContainer>
      <StyledDivider />
      <FormTitle
        title={t('id-doc.title')}
        description={t('id-doc.description')}
      />
      {/* TODO: https://linear.app/footprint/issue/FP-1607/improve-toggle-react-hook-form-integration */}
      <Controller
        control={control}
        name="idDoc.idDoc"
        render={({ field }) => (
          <Toggle
            onBlur={field.onBlur}
            onChange={nextValue => {
              field.onChange(nextValue);
            }}
            label={t('id-doc.toggle-label')}
            checked={field.value}
            sx={{ justifyContent: 'flex-start' }}
          />
        )}
      />
      {/* TODO: https://linear.app/footprint/issue/FP-1595/create-pdf-with-supported-doc-types-and-countries-that-we-can-link */}
      {/* <Typography variant="caption-1" color="tertiary" sx={{ marginTop: 6 }}>
        {t('id-doc.supported-docs')}&nbsp;
        <Link href="/" target="_blank" rel="noreferrer noopener">
          {t('id-doc.supported-docs-link')}
        </Link>
      </Typography> */}
    </form>
  );
};

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: ${theme.spacing[8]} 0;
  `}
`;

const CheckboxContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default CollectForm;
