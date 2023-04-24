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
import { CountryCode, CountryCode3, IdDocType } from '@onefootprint/types';
import {
  Button,
  CountrySelect,
  CountrySelectOption,
  Divider,
  RadioSelect,
  RadioSelectOptionFields,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle, NavigationHeader } from '../../../../components';
import { useIdDocMachine } from '../../components/machine-provider';
import IdDocTypesByCountry from './id-doc-types-by-country.constants';

const getCountryFromCode = (countryCode?: CountryCode) => {
  const match = COUNTRIES.find(country => country.value === countryCode);
  return match;
};

const getCountryFromCode3 = (countryCode?: CountryCode3) => {
  const match = COUNTRIES.find(country => country.value3 === countryCode);
  return match;
};

const IdDocCountryAndType = () => {
  const { t } = useTranslation('pages.country-and-type-selection');
  const [state, send] = useIdDocMachine();
  const { country: defaultCountry, type: defaultType } = state.context.idDoc;
  const [country, setCountry] = useState<CountryRecord>(
    getCountryFromCode3(defaultCountry) ?? DEFAULT_COUNTRY,
  );

  const types: IdDocType[] = IdDocTypesByCountry[country.value3];
  const firstTypeFromOptions = types.length ? types[0] : IdDocType.passport;
  const [docType, setDocType] = useState<IdDocType>(
    defaultType ?? firstTypeFromOptions,
  );

  const handleCountryChange = (option: CountrySelectOption) => {
    const nextCountry = getCountryFromCode(option.value);
    // Update both selected country and type
    if (nextCountry) {
      setCountry(nextCountry);
      const typesForNextCountry = IdDocTypesByCountry[nextCountry.value3];
      const nextType = typesForNextCountry.length
        ? typesForNextCountry[0]
        : IdDocType.passport;
      setDocType(nextType);
    }
  };

  const handleDocTypeChange = (value: string) => {
    setDocType(IdDocType[value as keyof typeof IdDocType]);
  };

  const handleSubmit = () => {
    send({
      type: 'idDocCountryAndTypeSelected',
      payload: {
        type: docType,
        country:
          getCountryFromCode(country.value)?.value3 ?? DEFAULT_COUNTRY.value3,
      },
    });
  };

  const optionByDocType: Record<IdDocType, RadioSelectOptionFields> = {
    [IdDocType.passport]: {
      title: t('form.type.passport.title'),
      description: t('form.type.passport.description'),
      IconComponent: IcoPassport24,
      value: t('form.type.passport.value'),
    },
    [IdDocType.driversLicense]: {
      title: t('form.type.driversLicense.title'),
      description: t('form.type.driversLicense.description'),
      IconComponent: IcoCar24,
      value: t('form.type.driversLicense.value'),
    },
    [IdDocType.idCard]: {
      title: t('form.type.idCard.title'),
      description: t('form.type.idCard.description'),
      IconComponent: IcoIdCard24,
      value: t('form.type.idCard.value'),
    },
  };
  const options: RadioSelectOptionFields[] = types.map(
    type => optionByDocType[type],
  );

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
          value={country}
        />
        <Divider />
        <RadioSelect
          value={optionByDocType[docType].value}
          options={options}
          onChange={handleDocTypeChange}
        />
      </InputsContainer>
      <Button fullWidth onClick={handleSubmit}>
        {t('form.cta')}
      </Button>
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
