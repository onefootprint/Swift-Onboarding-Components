import {
  COUNTRIES,
  CountryRecord,
  DEFAULT_COUNTRY,
} from '@onefootprint/global-constants';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import {
  IcoCar24,
  IcoIdCard24,
  IcoIdGeneric40,
  IcoPassport24,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { SubmitDocTypeResponse } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';
import {
  Button,
  CountrySelect,
  CountrySelectOption,
  Divider,
  RadioSelect,
  RadioSelectOptionFields,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import { useIdDocMachine } from '../../components/machine-provider';
import { getCountryFromCode } from '../../utils/get-country-from-code';
import useSubmitDocType from './hooks/use-submit-doc-type';
import SupportedDocTypesByCountry from './supported-doc-types-by-country.constants';

const IdDocCountryAndType = () => {
  const { t } = useTranslation('pages.country-and-type-selection');
  const [state, send] = useIdDocMachine();
  const submitDocTypeMutation = useSubmitDocType();
  const { idDoc: defaultCountryDoc, authToken } = state.context;
  const { country: defaultCountry, type: defaultType } = defaultCountryDoc;
  const requestErrorToast = useRequestErrorToast();
  const [country, setCountry] = useState<CountryRecord>(
    getCountryFromCode(defaultCountry) ?? DEFAULT_COUNTRY,
  );

  const { onlyUsSupported, supportedDocumentTypes } = state.context.requirement;
  const types: SupportedIdDocTypes[] = SupportedDocTypesByCountry[
    country.value
  ].filter(type => supportedDocumentTypes.includes(type));
  const firstTypeFromOptions = types.length
    ? types[0]
    : SupportedIdDocTypes.passport;
  const [docType, setDocType] = useState<SupportedIdDocTypes>(
    defaultType ?? firstTypeFromOptions,
  );

  const countryOptions = onlyUsSupported
    ? [getCountryFromCode('US') as CountryRecord]
    : COUNTRIES;

  const handleCountryChange = (option: CountrySelectOption) => {
    const nextCountry = getCountryFromCode(option.value);
    // Update both selected country and type
    if (nextCountry) {
      setCountry(nextCountry);
      const typesForNextCountry = SupportedDocTypesByCountry[
        nextCountry.value
      ].filter(type => supportedDocumentTypes.includes(type));
      const nextType = typesForNextCountry.length
        ? typesForNextCountry[0]
        : SupportedIdDocTypes.passport;
      setDocType(nextType);
    }
  };

  const handleDocTypeChange = (value: string) => {
    setDocType(value as SupportedIdDocTypes);
  };

  const handleSubmitDocTypeSuccess = (data: SubmitDocTypeResponse) => {
    const { id } = data;
    send({
      type: 'receivedCountryAndType',
      payload: {
        type: docType,
        country:
          getCountryFromCode(country.value)?.value ?? DEFAULT_COUNTRY.value,
        id,
      },
    });
  };

  const handleSubmit = () => {
    const selectedCountry =
      getCountryFromCode(country.value)?.value ?? DEFAULT_COUNTRY.value;
    submitDocTypeMutation.mutate(
      {
        authToken,
        documentType: docType,
        countryCode: selectedCountry,
      },
      {
        onSuccess: handleSubmitDocTypeSuccess,
        onError: requestErrorToast,
      },
    );
  };

  const optionByDocType: {
    [key in SupportedIdDocTypes]?: RadioSelectOptionFields;
  } = {};
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.passport)) {
    optionByDocType[SupportedIdDocTypes.passport] = {
      title: t('form.type.passport.title'),
      description: t('form.type.passport.description'),
      IconComponent: IcoPassport24,
      value: SupportedIdDocTypes.passport,
    };
  }
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.driversLicense)) {
    optionByDocType[SupportedIdDocTypes.driversLicense] = {
      title: t('form.type.driversLicense.title'),
      description: t('form.type.driversLicense.description'),
      IconComponent: IcoCar24,
      value: SupportedIdDocTypes.driversLicense,
    };
  }
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.idCard)) {
    optionByDocType[SupportedIdDocTypes.idCard] = {
      title: t('form.type.idCard.title'),
      description: t('form.type.idCard.description'),
      IconComponent: IcoIdCard24,
      value: SupportedIdDocTypes.idCard,
    };
  }

  // We only show the doc types supported by both the country and onboarding config
  const options: RadioSelectOptionFields[] = types
    .map(type => optionByDocType[type])
    .filter((option): option is RadioSelectOptionFields => !!option);

  return (
    <Container>
      <NavigationHeader />
      <IcoIdGeneric40 />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <InputsContainer>
        <CountrySelect
          data-private
          disabled={onlyUsSupported}
          label={t('form.country')}
          onChange={handleCountryChange}
          options={countryOptions}
          value={country}
          hint={onlyUsSupported ? t('form.only-us') : undefined}
        />
        <Divider />
        {options.length > 0 ? (
          <RadioSelect
            value={optionByDocType[docType]?.value}
            options={options}
            onChange={handleDocTypeChange}
          />
        ) : (
          <Typography
            variant="body-4"
            sx={{ textAlign: 'center', marginLeft: 5, marginRight: 5 }}
          >
            {t('form.not-supported')}
          </Typography>
        )}
      </InputsContainer>
      {options.length > 0 && (
        <Button fullWidth onClick={handleSubmit}>
          {t('form.cta')}
        </Button>
      )}
    </Container>
  );
};

const InputsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[5]};
    justify-content: center;
    align-items: center;
    width: 100%;

    > div {
      width: 100%;
    }
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
  `}
`;

export default IdDocCountryAndType;
