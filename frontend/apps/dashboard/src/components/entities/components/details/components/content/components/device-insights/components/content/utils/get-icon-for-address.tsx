import type { Color } from '@onefootprint/design-tokens';

import AddressCardIcon from '../components/address-card/components/address-card-icon';
import type AddressType from '../components/address-card/types';

const getIconForAddress = (type: AddressType, color?: Color, size?: 'small' | 'large') => (
  <AddressCardIcon type={type} color={color ?? 'primary'} size={size} />
);

export default getIconForAddress;
