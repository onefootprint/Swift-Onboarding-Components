import { COUNTRIES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import type { SupportedIdDocTypes } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import IdDocDisplay from '@/playbooks/components/id-doc-display';
import ListValue from '@/playbooks/components/list-value';

import type { Option } from '../../collected-information.types';

type DisplayValueProps<K extends keyof Option = keyof Option> = {
  name: K;
  value: Option[K];
};

const DisplayValue = ({ name, value }: DisplayValueProps) => {
  const { t } = useTranslation('pages.playbooks.collected-data');

  if (typeof value === 'boolean') {
    return value ? (
      <IcoCheck24 aria-label={t('enabled')} />
    ) : (
      <IcoCloseSmall24 aria-label={t('disabled')} />
    );
  }

  if (name === 'idDocKind') {
    return (
      <IdDocDisplay idDocKind={value as SupportedIdDocTypes[]} threshold={2} />
    );
  }

  if (name === 'ssn') {
    const ssnValue = value as NonNullable<Option['ssn']>;
    if (ssnValue.active) {
      return (
        <Typography variant="body-3">
          {t(`${ssnValue.kind}`)} {ssnValue.optional ? t('optional') : ''}
        </Typography>
      );
    }
    return <IcoCloseSmall24 />;
  }

  if (name === 'internationalCountryRestrictions') {
    const countries = value as NonNullable<
      Option['internationalCountryRestrictions']
    >;
    if (!countries || countries.length === 0) {
      return <Typography variant="body-3">{t('none')}</Typography>;
    }

    return (
      <ListValue
        value={countries.map(countryCode => {
          const countryFound = COUNTRIES.find(
            country => country.value === countryCode,
          );
          if (countryFound) return countryFound.label;
          return countryCode;
        })}
        threshold={2}
      />
    );
  }

  if (name === 'countriesRestrictions' && value) {
    const countries = value as NonNullable<Option['countriesRestrictions']>;
    return (
      <ListValue
        value={countries.map(country => country.label)}
        threshold={2}
      />
    );
  }

  return null;
};

export default DisplayValue;
