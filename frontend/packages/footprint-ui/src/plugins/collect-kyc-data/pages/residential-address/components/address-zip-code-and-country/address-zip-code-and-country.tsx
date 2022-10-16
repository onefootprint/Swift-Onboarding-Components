import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import {
  Button,
  CountrySelect,
  CountrySelectOption,
  TextInput,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../../components/header-title';
import { useCollectKycDataMachine } from '../../../../components/machine-provider';
import NavigationHeader from '../../../../components/navigation-header';
import { ResidentialZipCodeAndCountry } from '../../../../utils/data-types';
import useInputValidations from '../../hooks/use-input-validations';
import getInitialCountry from '../../utils/get-initial-country';

type FormData = {
  [UserDataAttribute.country]: CountrySelectOption;
  [UserDataAttribute.zip]: string;
};

export type AddressZipCodeAndCountryProps = {
  isMutationLoading: boolean;
  onSubmit: (residentialAddress: ResidentialZipCodeAndCountry) => void;
  ctaLabel?: string;
  hideTitle?: boolean;
  hideNavHeader?: boolean;
};

const AddressZipCodeAndCountry = ({
  isMutationLoading,
  onSubmit,
  hideTitle,
  ctaLabel,
  hideNavHeader,
}: AddressZipCodeAndCountryProps) => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const { t } = useTranslation(
    'pages.residential-address.zip-code-and-country',
  );
  const { t: cta } = useTranslation('pages.cta');
  const {
    watch,
    control,
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.country]: getInitialCountry(
        data[UserDataAttribute.country],
      ),
      [UserDataAttribute.zip]: data[UserDataAttribute.zip],
    },
  });

  const country = watch(UserDataAttribute.country);
  const { zipcode } = useInputValidations(country.value);

  const onSubmitFormData = (formData: FormData) => {
    onSubmit({
      zip: formData.zip,
      country: formData.country.value,
    });
  };

  const handleCountryChange = () => {
    setValue(UserDataAttribute.zip, '');
    setFocus(UserDataAttribute.zip);
  };

  return (
    <>
      {!hideNavHeader && <NavigationHeader />}
      <Form onSubmit={handleSubmit(onSubmitFormData)}>
        {!hideTitle && (
          <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        )}
        <Controller
          control={control}
          name={UserDataAttribute.country}
          render={({ field }) => (
            <CountrySelect
              label={t('form.country.label')}
              onBlur={field.onBlur}
              onChange={nextValue => {
                field.onChange(nextValue);
                handleCountryChange();
              }}
              placeholder={t('form.country.placeholder')}
              value={field.value}
            />
          )}
        />

        <TextInput
          autoComplete="postal-code"
          hasError={!!errors.zip}
          hint={errors.zip && t('form.zipCode.error')}
          label={t('form.zipCode.label')}
          mask={zipcode.mask}
          maxLength={zipcode.maxLength}
          minLength={zipcode.minLength}
          placeholder={t('form.zipCode.placeholder')}
          {...register(UserDataAttribute.zip, {
            required: true,
            pattern: zipcode.pattern,
          })}
        />

        <Button type="submit" fullWidth loading={isMutationLoading}>
          {ctaLabel ?? cta('continue')}
        </Button>
      </Form>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default AddressZipCodeAndCountry;
