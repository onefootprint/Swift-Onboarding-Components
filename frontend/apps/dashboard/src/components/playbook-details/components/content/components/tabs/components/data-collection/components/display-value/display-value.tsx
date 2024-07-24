import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import { CollectedKycDataOption } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type DisplayValueProps = {
  field: string;
  mustCollectData: string[];
  optionalData?: string[];
};

const DisplayValue = ({ field, mustCollectData, optionalData = [] }: DisplayValueProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection' });

  if (field === 'ssn') {
    if (mustCollectData.includes(CollectedKycDataOption.ssn9)) {
      return <Text variant="body-3">{t('full')}</Text>;
    }
    if (mustCollectData.includes(CollectedKycDataOption.ssn4)) {
      return <Text variant="body-3">{t('last4')}</Text>;
    }
    if (optionalData.includes(CollectedKycDataOption.ssn9)) {
      return <Text variant="body-3">{t('full_optional')}</Text>;
    }
    if (optionalData.includes(CollectedKycDataOption.ssn4)) {
      return <Text variant="body-3">{t('last4_optional')}</Text>;
    }
    return <IcoCloseSmall24 testID="close-icon" />;
  }

  if (mustCollectData.includes(field)) {
    return <IcoCheck24 testID="check-icon" />;
  }
  return <IcoCloseSmall24 testID="close-icon" />;
};

export default DisplayValue;
