import {
  COUNTRIES,
  CountryRecord,
  DEFAULT_COUNTRY,
} from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCar24,
  IcoIdCard24,
  IcoIdGeneric40,
  IcoPassport24,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { IdDocType } from '@onefootprint/types';
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
import supportedTypeToIdDocType from '../../utils/supported-type-to-doc-type';
import IdDocTypesByCountry from './id-doc-types-by-country.constants';

const IdDocCountryAndType = () => {
  const { t } = useTranslation('pages.country-and-type-selection');
  const [state, send] = useIdDocMachine();
  const { country: defaultCountry, type: defaultType } = state.context.idDoc;
  const [country, setCountry] = useState<CountryRecord>(
    getCountryFromCode(defaultCountry) ?? DEFAULT_COUNTRY,
  );

  const { onlyUsSupported, supportedDocumentTypes } = state.context.requirement;
  const supportedIdDocTypes = supportedDocumentTypes.map(
    supportedDocumentType => supportedTypeToIdDocType[supportedDocumentType],
  ); // get rid of this line once back end fixes the typo with "drivers license" in id-doc type
  const types: IdDocType[] = IdDocTypesByCountry[country.value].filter(type =>
    supportedIdDocTypes.includes(type),
  );
  const firstTypeFromOptions = types.length ? types[0] : IdDocType.passport;
  const [docType, setDocType] = useState<IdDocType>(
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
      const typesForNextCountry = IdDocTypesByCountry[nextCountry.value].filter(
        type => supportedIdDocTypes.includes(type),
      );
      const nextType = typesForNextCountry.length
        ? typesForNextCountry[0]
        : IdDocType.passport;
      setDocType(nextType);
    }
  };

  const handleDocTypeChange = (value: string) => {
    setDocType(value as IdDocType);
  };

  const handleSubmit = () => {
    send({
      type: 'receivedCountryAndType',
      payload: {
        type: docType,
        country:
          getCountryFromCode(country.value)?.value ?? DEFAULT_COUNTRY.value,
      },
    });
  };

  const optionByDocType: { [key in IdDocType]?: RadioSelectOptionFields } = {};
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.passport)) {
    optionByDocType[IdDocType.passport] = {
      title: t('form.type.passport.title'),
      description: t('form.type.passport.description'),
      IconComponent: IcoPassport24,
      value: IdDocType.passport,
    };
  }
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.driversLicense)) {
    optionByDocType[IdDocType.driversLicense] = {
      title: t('form.type.driversLicense.title'),
      description: t('form.type.driversLicense.description'),
      IconComponent: IcoCar24,
      value: IdDocType.driversLicense,
    };
  }
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.idCard)) {
    optionByDocType[IdDocType.idCard] = {
      title: t('form.type.idCard.title'),
      description: t('form.type.idCard.description'),
      IconComponent: IcoIdCard24,
      value: IdDocType.idCard,
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
          label={t('form.country')}
          onChange={handleCountryChange}
          options={countryOptions}
          value={country}
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
