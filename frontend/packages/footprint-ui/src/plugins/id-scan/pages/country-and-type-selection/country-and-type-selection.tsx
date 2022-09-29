import {
  AcceptedIdDocTypesByCountry,
  COUNTRIES,
  CountryRecord,
  DEFAULT_COUNTRY,
} from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoCar24, IcoIdCard24, IcoPassport24 } from '@onefootprint/icons';
import { CountryCode, IdScanDocType } from '@onefootprint/types';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import {
  Button,
  CountrySelect,
  CountrySelectOption,
  Divider,
  RadioSelect,
  RadioSelectOptionFields,
} from 'ui';

import HeaderTitle from '../../../../components/header-title';
import { useIdScanMachine } from '../../components/machine-provider';
import { Events } from '../../utils/state-machine/types';

const getCountryFromCode = (countryCode: CountryCode) => {
  const match = COUNTRIES.find(country => country.value === countryCode);
  return match;
};

const CountryAndTypeSelection = () => {
  const [, send] = useIdScanMachine();
  const [country, setCountry] = useState<CountryRecord>(DEFAULT_COUNTRY);
  const [docType, setDocType] = useState<IdScanDocType>(IdScanDocType.passport);
  const { t } = useTranslation('pages.country-and-type-selection');

  const handleCountryChange = (option: CountrySelectOption) => {
    const nextCountry = getCountryFromCode(option.value);
    if (nextCountry) {
      setCountry(nextCountry);
    }
  };

  const handleDocTypeChange = (value: string) => {
    setDocType(IdScanDocType[value as keyof typeof IdScanDocType]);
  };

  const optionByDocType: Record<IdScanDocType, RadioSelectOptionFields> = {
    [IdScanDocType.passport]: {
      title: t('form.type.passport.title'),
      description: t('form.type.passport.description'),
      IconComponent: IcoPassport24,
      value: t('form.type.passport.value'),
    },
    [IdScanDocType.driversLicense]: {
      title: t('form.type.driversLicense.title'),
      description: t('form.type.driversLicense.description'),
      IconComponent: IcoCar24,
      value: t('form.type.driversLicense.value'),
    },
    [IdScanDocType.idCard]: {
      title: t('form.type.idCard.title'),
      description: t('form.type.idCard.description'),
      IconComponent: IcoIdCard24,
      value: t('form.type.idCard.value'),
    },
  };

  const types: IdScanDocType[] = AcceptedIdDocTypesByCountry[country.value3];
  const options: RadioSelectOptionFields[] = types.map(
    type => optionByDocType[type],
  );

  const handleSubmit = () => {
    send({
      type: Events.idCountryAndTypeSelected,
      payload: {
        type: docType,
        country:
          getCountryFromCode(country.value)?.value3 ?? DEFAULT_COUNTRY.value3,
      },
    });
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <CountrySelect
        label={t('form.country')}
        onChange={handleCountryChange}
        value={country}
      />
      <Divider />
      <RadioSelect
        defaultSelected={options.length ? options[0].value : undefined}
        options={options}
        onSelect={handleDocTypeChange}
      />
      <Button fullWidth onClick={handleSubmit}>
        {t('form.cta')}
      </Button>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[8]}px;
    justify-content: center;
    align-items: center;

    > * {
      width: 100%;
    }
  `}
`;

export default CountryAndTypeSelection;
