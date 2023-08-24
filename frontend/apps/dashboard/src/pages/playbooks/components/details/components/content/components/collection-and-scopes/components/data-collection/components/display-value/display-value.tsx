import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import React from 'react';

export type DisplayValueProps = {
  field: string;
  attributes: string[];
};

const DisplayValue = ({ field, attributes }: DisplayValueProps) => {
  if (attributes.includes(field)) {
    return <IcoCheck24 testID="check-icon" />;
  }
  return <IcoCloseSmall24 testID="close-icon" />;
};

export default DisplayValue;
