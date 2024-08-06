import { IconButton } from '@onefootprint/ui';

import type { NavigationHeaderRightButtonProps } from '../../types';

const NavigationIconButton = ({ icon: Icon, onClick, color, label = '' }: NavigationHeaderRightButtonProps) => (
  <IconButton onClick={onClick} aria-label={label}>
    <Icon color={color} />
  </IconButton>
);

export default NavigationIconButton;
