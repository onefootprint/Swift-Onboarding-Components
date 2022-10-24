import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataOption, UserDataAttribute } from '@onefootprint/types';
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

type FormData = KycDataFormData &
  IdDocFormData & {
    addressKind?:
      | CollectedDataOption.fullAddress
      | CollectedDataOption.partialAddress;
    showAddressOptions: boolean;
    showSSNOptions: boolean;
    ssnKind?: UserDataAttribute.ssn4 | UserDataAttribute.ssn9;
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

  const getInitialAddressKind = () => {
    if (defaultKycData.full_address) {
      return CollectedDataOption.fullAddress;
    }
    if (defaultKycData.partial_address) {
      return CollectedDataOption.partialAddress;
    }
    return undefined;
  };

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
      ...defaultKycData,
      ...defaultIdDocData,
      addressKind: getInitialAddressKind(),
      showAddressOptions: innerFields.address,
      showSSNOptions: innerFields.ssn,
      ssnKind: getInitialSSNKind(),
    },
  });

  const handleSSNKindsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setInnerFields(prevState => ({ ...prevState, ssn: checked }));
    setValue('ssnKind', checked ? UserDataAttribute.ssn9 : undefined);
  };

  const handleAddressChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setInnerFields(prevState => ({ ...prevState, address: checked }));
    setValue(
      'addressKind',
      checked ? CollectedDataOption.fullAddress : undefined,
    );
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const submittedData = {
      kycData: {
        [CollectedDataOption.dob]: formData[CollectedDataOption.dob],
        [CollectedDataOption.email]: formData[CollectedDataOption.email],
        [CollectedDataOption.phoneNumber]:
          formData[CollectedDataOption.phoneNumber],
        [CollectedDataOption.name]: formData[CollectedDataOption.name],
        [UserDataAttribute.ssn4]: formData.ssnKind === UserDataAttribute.ssn4,
        [UserDataAttribute.ssn9]: formData.ssnKind === UserDataAttribute.ssn9,
        [CollectedDataOption.fullAddress]:
          formData.addressKind === CollectedDataOption.fullAddress,
        [CollectedDataOption.partialAddress]:
          formData.addressKind === CollectedDataOption.partialAddress,
      },
      idDoc: {
        idDocRequired: formData.idDocRequired,
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
          label={allT('collected-data-options.phone_number')}
          disabled
          checked
        />
        <Checkbox
          label={allT('collected-data-options.email')}
          disabled
          checked
        />
        <Checkbox
          label={allT('collected-data-options.name')}
          {...register('name')}
        />
        <Checkbox
          label={allT('collected-data-options.dob')}
          {...register(UserDataAttribute.dob)}
        />
        <Box>
          <Checkbox
            label={t('collected-data.ssn')}
            {...register('showSSNOptions')}
            onChange={handleSSNKindsChange}
          />
          <RadioGroupContainer isExpanded={!!innerFields.ssn}>
            <Radio
              value={UserDataAttribute.ssn9}
              label={t('collected-data.ssn_full')}
              {...register('ssnKind')}
            />
            <Radio
              value={UserDataAttribute.ssn4}
              label={t('collected-data.ssn_last_4')}
              {...register('ssnKind')}
            />
          </RadioGroupContainer>
        </Box>
        <Box>
          <Checkbox
            label={t('collected-data.address')}
            {...register('showAddressOptions')}
            onChange={handleAddressChanged}
          />
          <RadioGroupContainer isExpanded={!!innerFields.address}>
            <Radio
              value={CollectedDataOption.fullAddress}
              label={t('collected-data.full_address')}
              {...register('addressKind')}
            />
            <Radio
              value={CollectedDataOption.partialAddress}
              label={t('collected-data.partial_address')}
              {...register('addressKind')}
            />
          </RadioGroupContainer>
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
        name="idDocRequired"
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
    margin: ${theme.spacing[8]}px 0;
  `}
`;

const CheckboxContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]}px;
  `}
`;

export default CollectForm;
