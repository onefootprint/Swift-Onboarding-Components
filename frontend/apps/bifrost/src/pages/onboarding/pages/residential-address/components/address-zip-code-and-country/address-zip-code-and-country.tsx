import { HeaderTitle } from 'footprint-ui';
import { useTranslation } from 'hooks';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import ProgressHeader from 'src/pages/onboarding/components/progress-header';
import useOnboardingMachine from 'src/pages/onboarding/hooks/use-onboarding-machine';
import { isMissingSsnAttribute } from 'src/utils/state-machine/onboarding/utils/missing-attributes';
import { ResidentialZipCodeAndCountry } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { UserDataAttribute } from 'types';
import { Button, CountrySelect, CountrySelectOption, TextInput } from 'ui';

import useInputValidations from '../../hooks/use-input-validations';
import getInitialCountry from '../../utils/get-initial-country';

type FormData = {
  [UserDataAttribute.country]: CountrySelectOption;
  [UserDataAttribute.zip]: string;
};

export type AddressZipCodeAndCountryProps = {
  isMutationLoading: boolean;
  onSubmit: (residentialAddress: ResidentialZipCodeAndCountry) => void;
};

const AddressZipCodeAndCountry = ({
  isMutationLoading,
  onSubmit,
}: AddressZipCodeAndCountryProps) => {
  const [state] = useOnboardingMachine();
  const { data, missingAttributes } = state.context;
  const { t } = useTranslation(
    'pages.onboarding.residential-address.zip-code-and-country',
  );
  const { t: cta } = useTranslation('pages.onboarding.cta');
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

  const hasOtherMissingAttributes = isMissingSsnAttribute(missingAttributes);

  return (
    <>
      <ProgressHeader />
      <Form onSubmit={handleSubmit(onSubmitFormData)}>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
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
          {hasOtherMissingAttributes ? cta('continue') : cta('complete')}
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
