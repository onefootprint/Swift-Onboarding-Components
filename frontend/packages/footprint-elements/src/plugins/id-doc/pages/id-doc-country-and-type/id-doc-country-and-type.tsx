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
import { CountryCode, IdDocType } from '@onefootprint/types';
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

import HeaderTitle from '../../../../components/header-title';
import { useIdDocMachine } from '../../components/machine-provider';
import { Events } from '../../utils/state-machine/types';
import IdDocTypesByCountry from './id-doc-types-by-country.constants';

const getCountryFromCode = (countryCode: CountryCode) => {
  const match = COUNTRIES.find(country => country.value === countryCode);
  return match;
};

const IdDocCountryAndType = () => {
  const { t } = useTranslation('pages.country-and-type-selection');
  const [, send] = useIdDocMachine();
  const [country, setCountry] = useState<CountryRecord>(DEFAULT_COUNTRY);
  const types: IdDocType[] = IdDocTypesByCountry[country.value3];

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
  const [docType, setDocType] = useState<IdDocType>(
    types.length ? types[0] : IdDocType.passport,
  );

  const handleCountryChange = (option: CountrySelectOption) => {
    const nextCountry = getCountryFromCode(option.value);
    if (nextCountry) {
      setCountry(nextCountry);
    }
  };

  const handleDocTypeChange = (value: string) => {
    setDocType(IdDocType[value as keyof typeof IdDocType]);
  };

  const handleSubmit = () => {
    send({
      type: Events.idDocCountryAndTypeSelected,
      payload: {
        type: docType,
        country:
          getCountryFromCode(country.value)?.value3 ?? DEFAULT_COUNTRY.value3,
      },
    });
  };

  return (
    <Container>
      <IcoIdGeneric40 />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <CountrySelect
        data-private
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
    row-gap: ${theme.spacing[8]};
    justify-content: center;
    align-items: center;

    > div {
      width: 100%;
    }
  `}
`;

export default IdDocCountryAndType;
