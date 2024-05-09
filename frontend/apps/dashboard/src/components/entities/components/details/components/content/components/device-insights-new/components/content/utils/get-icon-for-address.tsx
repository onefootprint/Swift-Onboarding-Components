import type { Color } from '@onefootprint/design-tokens';
import React from 'react';

import AddressCardIcon from '../components/address-card/components/address-card-icon';
import type AddressType from '../components/address-card/types';

const getIconForAddress = (type: AddressType, color?: Color) => (
  <AddressCardIcon type={type} color={color ?? 'primary'} />
);

export default getIconForAddress;
