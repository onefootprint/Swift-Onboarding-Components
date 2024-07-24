import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import { CollectedKycDataOption, SupportedIdDocTypes } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import IdDocDisplay from 'src/pages/playbooks/components/id-doc-display';

export type DisplayValueProps = {
  field: string;
  mustCollectData: string[];
  optionalData?: string[];
};

const DisplayValue = ({ field, mustCollectData, optionalData = [] }: DisplayValueProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection' });

  if (field === 'document') {
    const documentString = mustCollectData.find(a => a.match('document'));
    const idDocKinds = Object.values(SupportedIdDocTypes).filter(k => documentString?.includes(k));
    if (idDocKinds.length > 0) {
      return <IdDocDisplay idDocKind={idDocKinds} threshold={2} />;
    }
    return <IcoCloseSmall24 testID="close-icon" />;
  }
  if (field.match('selfie')) {
    const documentString = mustCollectData.find(a => a.match('document'));
    if (documentString?.includes('require_selfie')) {
      return <IcoCheck24 testID="check-icon" />;
    }
    return <IcoCloseSmall24 testID="close-icon" />;
  }
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
