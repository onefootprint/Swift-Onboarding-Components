import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import React from 'react';

import type { BusinessInformation } from '@/playbooks/utils/machine/types';

type DisplayValueProps = {
  field: keyof BusinessInformation;
  businessInformation: BusinessInformation;
};

const DisplayValue = ({ field, businessInformation }: DisplayValueProps) => {
  const value = businessInformation[field];

  if (typeof value === 'boolean') {
    if (value) {
      return <IcoCheck24 testID="check-icon" />;
    }
    return <IcoCloseSmall24 testID="close-icon" />;
  }

  return null;
};

export default DisplayValue;
