import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CollectedKycDataOption,
  IdDI,
  isCountryCode,
} from '@onefootprint/types';
import { Grid } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import allAttributes from '../../utils/all-attributes/all-attributes';
import getInitialCountry from '../../utils/get-initial-country';
import AddressLines from './components/address-lines';
import CityField from './components/city-field';
import CountryField from './components/country-field';
import StateField from './components/state-field';
import ZipField from './components/zip-field';
import useConvertFormData from './hooks/use-convert-form-data';
import { FormData } from './types';
import getInitialState from './utils/get-initial-state';

type ResidentialAddressProps = {
  ctaLabel?: string;
  onComplete?: () => void;
  onCancel?: () => void;
  hideHeader?: boolean;
};

const ResidentialAddress = ({
  ctaLabel,
  onComplete,
  onCancel,
  hideHeader,
}: ResidentialAddressProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { requirement, data, config } = state.context;
  const { mutation, syncData } = useSyncData();
  const convertFormData = useConvertFormData();

  const requiresFullAddress = allAttributes(requirement).includes(
    CollectedKycDataOption.fullAddress,
  );
  const { t } = useTranslation('pages.residential-address');
  const title = requiresFullAddress ? t('full.title') : t('partial.title');
  const subtitle = requiresFullAddress
    ? t('full.subtitle')
    : t('partial.subtitle');

  const isAddressLine1Disabled = data[IdDI.addressLine1]?.disabled;
  const isAddressLine2Disabled = data[IdDI.addressLine2]?.disabled;
  const isCityDisabled = data[IdDI.city]?.disabled;
  const isStateDisabled = data[IdDI.state]?.disabled;
  const isZipDisabled = data[IdDI.zip]?.disabled;
  const isCountryDisabled =
    data[IdDI.country]?.disabled || !config.allowInternationalResidents;

  const countryVal = data[IdDI.country]?.value;
  const defaultCountry =
    countryVal && isCountryCode(countryVal) ? countryVal : undefined;
  const defaultValues = {
    country: getInitialCountry(defaultCountry),
    state: getInitialState(data[IdDI.state]?.value),
    city: data[IdDI.city]?.value,
    zip: data[IdDI.zip]?.value,
    addressLine1: data[IdDI.addressLine1]?.value,
    addressLine2: data[IdDI.addressLine2]?.value,
  };
  const methods = useForm<FormData>({
    defaultValues,
  });
  const { watch, handleSubmit, setFocus, resetField } = methods;
  const country = watch('country');

  const onSubmitFormData = (formData: FormData) => {
    const convertedData = convertFormData(formData);
    syncData({
      data: convertedData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'dataSubmitted',
          payload: convertedData,
        });
        onComplete?.();
      },
    });
  };

  const handleCountryChange = () => {
    setFocus('addressLine1');
    resetField('addressLine1');
    resetField('addressLine2');
    resetField('city');
    resetField('state');
    resetField('zip');
  };

  return (
    <>
      {!hideHeader && <NavigationHeader />}
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onSubmitFormData)}>
          {!hideHeader && <HeaderTitle title={title} subtitle={subtitle} />}
          {requiresFullAddress ? (
            <>
              <CountryField
                onChange={handleCountryChange}
                disabled={isCountryDisabled}
              />
              <AddressLines
                countryCode={country.value}
                disabled={isAddressLine1Disabled || isAddressLine2Disabled}
              />
              <Grid.Row>
                <Grid.Column col={6}>
                  <CityField disabled={isCityDisabled} />
                </Grid.Column>
                <Grid.Column col={6}>
                  <ZipField
                    countryCode={country.value}
                    disabled={isZipDisabled}
                  />
                </Grid.Column>
              </Grid.Row>
              <StateField
                inputKind={country.value === 'US' ? 'dropdown' : 'text'}
                disabled={isStateDisabled}
              />
            </>
          ) : (
            <>
              <CountryField
                onChange={handleCountryChange}
                disabled={isCountryDisabled}
              />
              <ZipField countryCode={country.value} disabled={isZipDisabled} />
            </>
          )}
          <EditableFormButtonContainer
            isLoading={mutation.isLoading}
            onCancel={onCancel}
            ctaLabel={ctaLabel}
          />
        </Form>
      </FormProvider>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default ResidentialAddress;
