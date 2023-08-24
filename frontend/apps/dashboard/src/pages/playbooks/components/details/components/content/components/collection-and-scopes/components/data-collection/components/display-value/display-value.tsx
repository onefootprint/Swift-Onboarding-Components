import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';
import IdDocDisplay from 'src/pages/playbooks/components/id-doc-display';

export type DisplayValueProps = {
  field: string;
  attributes: string[];
};

const DisplayValue = ({ field, attributes }: DisplayValueProps) => {
  if (field.match('document')) {
    const idDocKinds = Object.values(SupportedIdDocTypes).filter(k =>
      field.includes(k),
    );
    return <IdDocDisplay idDocKind={idDocKinds} threshold={2} />;
  }

  if (attributes.includes(field)) {
    return <IcoCheck24 testID="check-icon" />;
  }
  return <IcoCloseSmall24 testID="close-icon" />;
};

export default DisplayValue;
