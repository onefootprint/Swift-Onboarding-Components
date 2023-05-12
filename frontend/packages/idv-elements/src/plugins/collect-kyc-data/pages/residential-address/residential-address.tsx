import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedKycDataOption,
  IdDI,
  isCountryCode,
} from '@onefootprint/types';
import { Grid } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../components/layout/components/header-title';
import CtaButton from '../../components/cta-button';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import AddressLines from './components/address-lines';
import CityField from './components/city-field';
import CountryField from './components/country-field';
import StateField from './components/state-field';
import ZipField from './components/zip-field';
import useConvertFormData from './hooks/use-convert-form-data';
import { FormData } from './types';
import getInitialCountry from './utils/get-initial-country';
import getInitialState from './utils/get-initial-state';

type ResidentialAddressProps = {
  ctaLabel?: string;
  onComplete?: () => void;
  hideHeader?: boolean;
};

const ResidentialAddress = ({
  ctaLabel,
  onComplete,
  hideHeader,
}: ResidentialAddressProps) => {
  const [state, send] = useCollectKycDataMachine();
  const {
    requirement: { missingAttributes },
    data,
  } = state.context;
  const { mutation, syncData } = useSyncData();
  const convertFormData = useConvertFormData();

  const requiresFullAddress = missingAttributes.includes(
    CollectedKycDataOption.fullAddress,
  );
  const { t } = useTranslation('pages.residential-address');
  const title = requiresFullAddress ? t('full.title') : t('partial.title');
  const subtitle = requiresFullAddress
    ? t('full.subtitle')
    : t('partial.subtitle');

  const isAddressLine1Fixed = data[IdDI.addressLine1]?.fixed;
  const isAddressLine2Fixed = data[IdDI.addressLine2]?.fixed;
  const isCityFixed = data[IdDI.city]?.fixed;
  const isStateFixed = data[IdDI.state]?.fixed;
  const isZipFixed = data[IdDI.zip]?.fixed;
  const isCountryFixed = data[IdDI.country]?.fixed;
  const isFullAddressFixed =
    isAddressLine1Fixed ||
    isAddressLine2Fixed ||
    isCityFixed ||
    isStateFixed ||
    isZipFixed ||
    isCountryFixed;

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
  const { watch, handleSubmit, setFocus, setValue } = methods;
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
    setValue('addressLine1', '');
    setValue('addressLine2', '');
    setValue('city', '');
    setValue('state', '');
    setValue('zip', '');
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
                disabled={isFullAddressFixed}
              />
              <AddressLines
                countryCode={country.value}
                disabled={isFullAddressFixed}
              />
              <Grid.Row>
                <Grid.Column col={6}>
                  <CityField disabled={isFullAddressFixed} />
                </Grid.Column>
                <Grid.Column col={6}>
                  <ZipField
                    countryCode={country.value}
                    disabled={isFullAddressFixed}
                  />
                </Grid.Column>
              </Grid.Row>
              <StateField
                inputKind={country.value === 'US' ? 'dropdown' : 'text'}
                disabled={isFullAddressFixed}
              />
            </>
          ) : (
            <>
              <CountryField
                onChange={handleCountryChange}
                disabled={isCountryFixed}
              />
              <ZipField countryCode={country.value} disabled={isZipFixed} />
            </>
          )}
          <CtaButton isLoading={mutation.isLoading} label={ctaLabel} />
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
