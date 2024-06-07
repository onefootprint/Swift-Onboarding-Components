import { COUNTRIES } from '@onefootprint/global-constants';
import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import type { SupportedIdDocTypes } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import IdDocDisplay from '@/playbooks/components/id-doc-display';
import ListValue from '@/playbooks/components/list-value';

import type { Option } from '../../collected-information.types';

type DisplayValueProps<K extends keyof Option = keyof Option> = {
  name: K;
  value: Option[K];
};

const DisplayValue = ({ name, value }: DisplayValueProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.collected-data',
  });

  if (typeof value === 'boolean') {
    return value ? <IcoCheck24 aria-label={t('enabled')} /> : <IcoCloseSmall24 aria-label={t('disabled')} />;
  }

  if (name === 'idDocKind') {
    return <IdDocDisplay idDocKind={value as SupportedIdDocTypes[]} threshold={2} />;
  }

  if (name === 'ssn') {
    const ssnValue = value as NonNullable<Option['ssn']>;
    if (ssnValue.active) {
      return (
        <Text variant="body-3">
          {t(`${ssnValue.kind}` as ParseKeys<'common'>)} {ssnValue.optional ? t('optional') : ''}
        </Text>
      );
    }
    return <IcoCloseSmall24 />;
  }

  if (name === 'internationalCountryRestrictions') {
    const countries = value as NonNullable<Option['internationalCountryRestrictions']>;
    if (!countries || countries.length === 0) {
      return <Text variant="body-3">{t('none')}</Text>;
    }

    return (
      <ListValue
        value={countries.map(countryCode => {
          const countryFound = COUNTRIES.find(country => country.value === countryCode);
          if (countryFound) return countryFound.label;
          return countryCode;
        })}
        threshold={2}
      />
    );
  }

  if (name === 'countriesRestrictions' && value) {
    const countries = value as NonNullable<Option['countriesRestrictions']>;
    return <ListValue value={countries.map(country => country.label)} threshold={2} />;
  }

  return null;
};

export default DisplayValue;
