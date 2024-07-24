import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Option } from '../../collected-information.types';

type DisplayValueProps<K extends keyof Option = keyof Option> = {
  name: K;
  value: Option[K];
};

const DisplayValue = ({ name, value }: DisplayValueProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.playbooks.collected-data' });

  if (typeof value === 'boolean') {
    return value ? <IcoCheck24 aria-label={t('enabled')} /> : <IcoCloseSmall24 aria-label={t('disabled')} />;
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

  return null;
};

export default DisplayValue;
