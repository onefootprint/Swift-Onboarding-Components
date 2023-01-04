import { IcoCloseSmall16 } from '@onefootprint/icons';
import React from 'react';

import Pill, { PillProps } from '../pill';

const ClearPill = ({ children, onClick }: PillProps) => (
  <Pill onClick={onClick} type="button">
    <IcoCloseSmall16 color="tertiary" />
    {children}
  </Pill>
);

export default ClearPill;
