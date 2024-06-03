import type { CountryCode } from '@onefootprint/types';
import { IdDI, isCountryCode } from '@onefootprint/types';
import { Grid, Stack } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData, { omitPhoneAndEmail } from '../../hooks/use-sync-data';
import type { KycData } from '../../utils/data-types';
import getInitialCountry from '../../utils/get-initial-country';
import AddressLines from './components/address-lines';
import CityField from './components/city-field';
import CountryField from './components/country-field';
import StateField from './components/state-field';
import ZipField from './components/zip-field';
import useConvertFormData from './hooks/use-convert-form-data';
import type { FormData } from './types';
import getInitialState from './utils/get-initial-state';

type ResidentialAddressProps = {
  ctaLabel?: string;
  onComplete?: (args: KycData) => void;
  onCancel?: () => void;
  hideHeader?: boolean;
  disableCountry?: boolean;
};

const ResidentialAddress = ({
  ctaLabel,
  onComplete,
  onCancel,
  hideHeader,
  disableCountry,
}: ResidentialAddressProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyc.pages.residential-address',
  });
  const [state, send] = useCollectKycDataMachine();
  const { data, config } = state.context;
  const countryFromContext = data[IdDI.country]?.value;
  const { mutation, syncData } = useSyncData();
  const convertFormData = useConvertFormData();

  let defaultCountry: CountryCode | undefined;
  const { supportedCountries } = config;
  const hasSupportedCountries =
    supportedCountries && supportedCountries.length > 0;
  const isValidCountryInContext =
    countryFromContext && isCountryCode(countryFromContext);
  const isSupportedCountryInContext =
    isValidCountryInContext && supportedCountries?.includes(countryFromContext);

  if (isSupportedCountryInContext) {
    defaultCountry = countryFromContext;
  } else if (!hasSupportedCountries && isValidCountryInContext) {
    defaultCountry = countryFromContext;
  } else if (hasSupportedCountries) {
    [defaultCountry] = supportedCountries;
  }

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
  const { handleSubmit, setFocus, resetField } = methods;

  const onSubmitFormData = (formData: FormData) => {
    syncData({
      data: omitPhoneAndEmail(convertFormData(formData)),
      onSuccess: cleanData => {
        send({
          type: 'dataSubmitted',
          payload: cleanData,
        });
        onComplete?.(cleanData);
      },
    });
  };

  const handleCountryChange = () => {
    resetField('addressLine1');
    resetField('addressLine2');
    resetField('city');
    resetField('state');
    resetField('zip');
    setFocus('addressLine1');
  };

  return (
    <>
      {!hideHeader && <NavigationHeader />}
      <FormProvider {...methods}>
        <Grid.Container
          tag="form"
          gap={7}
          onSubmit={handleSubmit(onSubmitFormData)}
          width="100%"
        >
          {!hideHeader && (
            <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
          )}
          <Stack gap={5} direction="column">
            <CountryField
              disabled={disableCountry}
              onChange={handleCountryChange}
            />
            <AddressLines />
            <Grid.Container columns={['1fr', '1fr']} gap={5}>
              <CityField />
              <ZipField />
            </Grid.Container>
            <StateField />
          </Stack>
          <EditableFormButtonContainer
            isLoading={mutation.isLoading}
            onCancel={onCancel}
            ctaLabel={ctaLabel}
          />
        </Grid.Container>
      </FormProvider>
    </>
  );
};

export default ResidentialAddress;
