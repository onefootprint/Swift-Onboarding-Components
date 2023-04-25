import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { Button, CountrySelectOption } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../../components/layout/components/navigation-header';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { ResidentialZipCodeAndCountry } from '../../../../utils/data-types';
import getInitialCountry from '../../utils/get-initial-country';
import CountryField from '../country-field';
import ZipField from '../zip-field';

type FormData = {
  [UserDataAttribute.country]: CountrySelectOption;
  [UserDataAttribute.zip]: string;
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
  const methods = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.country]: getInitialCountry(
        data[UserDataAttribute.country],
      ),
      [UserDataAttribute.zip]: data[UserDataAttribute.zip],
    },
  });
  const { watch, handleSubmit, setFocus, setValue } = methods;
  const country = watch(UserDataAttribute.country);

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
