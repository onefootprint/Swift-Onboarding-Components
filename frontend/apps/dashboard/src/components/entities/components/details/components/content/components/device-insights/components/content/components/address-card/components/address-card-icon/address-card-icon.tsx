import type { Color } from '@onefootprint/design-tokens';
import {
  IcoBuilding16,
  IcoBuilding24,
  IcoHome16,
  IcoHome24,
} from '@onefootprint/icons';
import React from 'react';

import AddressType from '../../types';

type AddressCardIconProps = {
  type: AddressType;
  color?: Color;
  size?: 'small' | 'large';
};

const AddressCardIcon = ({
  type,
  color = 'quinary',
  size = 'small',
}: AddressCardIconProps) => {
  if (type === AddressType.residential) {
    return size === 'small' ? (
      <IcoHome16 color={color} />
    ) : (
      <IcoHome24 color={color} />
    );
  }
  return size === 'large' ? (
    <IcoBuilding16 color={color} />
  ) : (
    <IcoBuilding24 color={color} />
  );
};

export default AddressCardIcon;
