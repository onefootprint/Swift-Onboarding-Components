import { IcoCheckSmall24, IcoCloseSmall24 } from '@onefootprint/icons';
import { useTranslation } from 'react-i18next';

import type { Option } from '../../collected-information.types';

type DisplayValueProps = {
  name: keyof Option;
  value: Option[keyof Option];
};

const DisplayValue = ({ name, value }: DisplayValueProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.playbooks.collected-data' });

  if (typeof value === 'boolean') {
    return value ? <IcoCheckSmall24 aria-label={t('enabled')} /> : <IcoCloseSmall24 aria-label={t('disabled')} />;
  }

  if (name === 'ssn') {
    const ssnValue = value as NonNullable<Option['ssn']>;
    if (ssnValue.active) {
      return <IcoCheckSmall24 aria-label={t('enabled')} />;
    }
    return <IcoCloseSmall24 />;
  }

  return null;
};

export default DisplayValue;
