import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { CountryCode } from '@onefootprint/types';
import { IdDI, isCountryCode } from '@onefootprint/types';
import { Grid, Stack } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
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
  const { t } = useTranslation('pages.residential-address');
  const [state, send] = useCollectKycDataMachine();
  const { data, config } = state.context;
  const countryFromContext = data[IdDI.country]?.value;
  const { mutation, syncData } = useSyncData();
  const convertFormData = useConvertFormData();

  let defaultCountry: CountryCode | undefined;
  if (countryFromContext && isCountryCode(countryFromContext)) {
    defaultCountry = countryFromContext;
  } else if (
    config.allowInternationalResidents &&
    config.supportedCountries &&
    config.supportedCountries.length > 0
  ) {
    [defaultCountry] = config.supportedCountries;
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
    const convertedData = convertFormData(formData);
    syncData({
      data: convertedData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'dataSubmitted',
          payload: convertedData,
        });
        onComplete?.(convertedData);
      },
      onError: (error: string) => {
        console.error(
          `Error while saving data on kyc residential-address page ${error}`,
        );
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
        <Form onSubmit={handleSubmit(onSubmitFormData)}>
          {!hideHeader && (
            <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
          )}
          <Stack gap={5} direction="column">
            <CountryField
              disabled={disableCountry}
              onChange={handleCountryChange}
            />
            <AddressLines />
            <Grid.Row>
              <Grid.Column col={6}>
                <CityField />
              </Grid.Column>
              <Grid.Column col={6}>
                <ZipField />
              </Grid.Column>
            </Grid.Row>
            <StateField />
          </Stack>
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
