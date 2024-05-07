import type { Color } from '@onefootprint/design-tokens';
import { IcoBuilding16, IcoHome16 } from '@onefootprint/icons';
import React from 'react';

import AddressType from '../../types';

type AddressCardIconProps = {
  type: AddressType;
  color?: Color;
};

const AddressCardIcon = ({ type, color = 'quinary' }: AddressCardIconProps) => {
  if (type === AddressType.business) {
    return <IcoHome16 color={color} />;
  }
  return <IcoBuilding16 color={color} />;
};

export default AddressCardIcon;
