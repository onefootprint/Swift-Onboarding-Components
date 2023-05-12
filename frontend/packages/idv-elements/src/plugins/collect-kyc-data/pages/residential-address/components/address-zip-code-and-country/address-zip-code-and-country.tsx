import { useTranslation } from '@onefootprint/hooks';
import { IdDI, isCountryCode } from '@onefootprint/types';
import { Button, CountrySelectOption } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/navigation-header';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { ResidentialZipCodeAndCountry } from '../../../../utils/data-types';
import getInitialCountry from '../../utils/get-initial-country';
import CountryField from '../country-field';
import ZipField from '../zip-field';

type FormData = {
  country: CountrySelectOption;
  zip: string;
};

export type AddressZipCodeAndCountryProps = {
  isMutationLoading: boolean;
  onSubmit: (residentialAddress: ResidentialZipCodeAndCountry) => void;
  ctaLabel?: string;
  hideHeader?: boolean;
};

const AddressZipCodeAndCountry = ({
  isMutationLoading,
  onSubmit,
  hideHeader,
  ctaLabel,
}: AddressZipCodeAndCountryProps) => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const { t } = useTranslation(
    'pages.residential-address.zip-code-and-country',
  );
  const { t: cta } = useTranslation('pages.cta');
  const countryVal = data[IdDI.country]?.value;
  const defaultCountry =
    countryVal && isCountryCode(countryVal) ? countryVal : undefined;
  const defaultValues = {
    country: getInitialCountry(defaultCountry),
    zip: data[IdDI.zip]?.value,
  };

  const methods = useForm<FormData>({
    defaultValues,
  });
  const { watch, handleSubmit, setFocus, setValue } = methods;
  const country = watch('country');

  const onSubmitFormData = (formData: FormData) => {
    onSubmit({
      [IdDI.zip]: { value: formData.zip },
      [IdDI.country]: { value: formData.country.value },
    });
  };

  const handleCountryChange = () => {
    setValue('zip', '');
    setFocus('zip');
  };

  return (
    <>
      {!hideHeader && <NavigationHeader />}
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onSubmitFormData)}>
          {!hideHeader && (
            <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
          )}
          <CountryField onChange={handleCountryChange} />
          <ZipField countryCode={country.value} />
          <Button type="submit" fullWidth loading={isMutationLoading}>
            {ctaLabel ?? cta('continue')}
          </Button>
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

export default AddressZipCodeAndCountry;
