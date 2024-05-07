import { IcoBuilding16, IcoHome16 } from '@onefootprint/icons';
import React from 'react';

import { AddressType } from '../../types';

type AddressCardIconProps = {
  type: AddressType;
};

const AddressCardIcon = ({ type }: AddressCardIconProps) => {
  if (type === AddressType.business) {
    return <IcoHome16 color="quinary" />;
  }
  return <IcoBuilding16 color="quinary" />;
};

export default AddressCardIcon;
