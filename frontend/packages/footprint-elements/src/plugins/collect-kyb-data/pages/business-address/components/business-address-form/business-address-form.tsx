import { STATES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { BusinessDataAttribute } from '@onefootprint/types';
import {
  AddressInput,
  CountrySelectOption,
  Grid,
  SelectOption,
  TextInput,
} from '@onefootprint/ui';
import Button from '@onefootprint/ui/src/components/button/button';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import { BusinessAddressData } from '../../../../utils/state-machine/types';
import getAddressComponent from '../../utils/get-address-components';
import getInitialCountry from '../../utils/get-initial-country';
import getInitialState from '../../utils/get-initial-state';
import CityField from '../city-field';
import CountryField from '../country-field';
import StateField from '../state-field';
import ZipField from '../zip-field';

type FormData = {
  [BusinessDataAttribute.addressLine1]: string;
  [BusinessDataAttribute.addressLine2]: string;
  [BusinessDataAttribute.city]: string;
  [BusinessDataAttribute.state]: string | SelectOption;
  [BusinessDataAttribute.country]: CountrySelectOption;
  [BusinessDataAttribute.zip]: string;
};

export type BusinessAddressFormProps = {
  defaultValues?: BusinessAddressData;
  isLoading: boolean;
  onSubmit: (businessAddress: BusinessAddressData) => void;
  ctaLabel?: string;
};

const BusinessAddressForm = ({
  defaultValues,
  isLoading,
  ctaLabel,
  onSubmit,
}: BusinessAddressFormProps) => {
  const { allT, t } = useTranslation('pages.business-address.form');

  const methods = useForm<FormData>({
    defaultValues: {
      [BusinessDataAttribute.country]: getInitialCountry(
        defaultValues?.[BusinessDataAttribute.country],
      ),
      [BusinessDataAttribute.state]: getInitialState(
        defaultValues?.[BusinessDataAttribute.state],
      ),
      [BusinessDataAttribute.city]: defaultValues?.[BusinessDataAttribute.city],
      [BusinessDataAttribute.zip]: defaultValues?.[BusinessDataAttribute.zip],
      [BusinessDataAttribute.addressLine1]:
        defaultValues?.[BusinessDataAttribute.addressLine1],
      [BusinessDataAttribute.addressLine2]:
        defaultValues?.[BusinessDataAttribute.addressLine2],
    },
  });

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    setValue,
  } = methods;
  const country = watch(BusinessDataAttribute.country);

  const onSubmitFormData = (formData: FormData) => {
    const stateData = formData[BusinessDataAttribute.state];
    const stateStr =
      typeof stateData === 'object' ? stateData.value : stateData;

    onSubmit({
      [BusinessDataAttribute.addressLine1]:
        formData[BusinessDataAttribute.addressLine1],
      [BusinessDataAttribute.addressLine2]:
        formData[BusinessDataAttribute.addressLine2],
      [BusinessDataAttribute.city]: formData[BusinessDataAttribute.city],
      [BusinessDataAttribute.zip]: formData[BusinessDataAttribute.zip],
      [BusinessDataAttribute.country]:
        formData[BusinessDataAttribute.country].value,
      [BusinessDataAttribute.state]: stateStr,
    });
  };

  const handleCountryChange = () => {
    setFocus(BusinessDataAttribute.addressLine1);
    setValue(BusinessDataAttribute.addressLine1, '');
    setValue(BusinessDataAttribute.addressLine2, '');
    setValue(BusinessDataAttribute.city, '');
    setValue(BusinessDataAttribute.state, '');
    setValue(BusinessDataAttribute.zip, '');
  };

  const handleAddressSelect = async (
    prediction?: google.maps.places.AutocompletePrediction | null,
  ) => {
    if (prediction) {
      const formattedStreetAddress =
        prediction?.structured_formatting.main_text;
      if (formattedStreetAddress) {
        setValue(BusinessDataAttribute.addressLine1, formattedStreetAddress);
      }

      const result = await getAddressComponent(prediction);
      if (result) {
        if (result.city) {
          setValue(BusinessDataAttribute.city, result.city);
        }
        if (result.state) {
          if (country.value === 'US') {
            const possibleState = STATES.find(
              stateOption => stateOption.label === result.state,
            );
            if (possibleState) {
              setValue(BusinessDataAttribute.state, possibleState);
            }
          } else {
            setValue(BusinessDataAttribute.state, result.state);
          }
        }
        if (result.zip) {
          setValue(BusinessDataAttribute.zip, result.zip);
        }
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmitFormData)}>
        <CountryField onChange={handleCountryChange} data-private />
        <AddressInput
          data-private
          country={country.value}
          hasError={!!errors[BusinessDataAttribute.addressLine1]}
          hint={
            errors[BusinessDataAttribute.addressLine1] &&
            t('address-line-1.error')
          }
          label={t('address-line-1.label')}
          onSelect={handleAddressSelect}
          placeholder={t('address-line-1.placeholder')}
          {...register(BusinessDataAttribute.addressLine1, { required: true })}
        />
        <TextInput
          data-private
          autoComplete="address-line2"
          label={t('address-line-2.label')}
          placeholder={t('address-line-2.placeholder')}
          {...register(BusinessDataAttribute.addressLine2)}
        />
        <Grid.Row>
          <Grid.Column col={6}>
            <CityField />
          </Grid.Column>
          <Grid.Column col={6}>
            <ZipField countryCode={country.value} />
          </Grid.Column>
        </Grid.Row>
        <StateField countryCode={country.value} />
        <Button type="submit" fullWidth loading={isLoading}>
          {ctaLabel ?? allT('pages.cta-continue')}
        </Button>
      </Form>
    </FormProvider>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default BusinessAddressForm;
