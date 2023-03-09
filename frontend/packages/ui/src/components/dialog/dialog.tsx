import { Icon } from '@onefootprint/icons';
import React from 'react';

import BaseDialog, {
  AllButtons,
  NoButtons,
  OnlyButtons,
  OnlyPrimaryButton,
  PrimaryAndLinkButtons,
  Size,
} from '../internal/base-dialog';

export type DialogProps = {
  children?: React.ReactNode;
  closeAriaLabel?: string;
  closeIconComponent?: Icon;
  onClose: () => void;
  open?: boolean;
  size?: Size;
  testID?: string;
  title: string;
  isConfirmation?: boolean;
} & (
  | OnlyPrimaryButton
  | OnlyButtons
  | PrimaryAndLinkButtons
  | NoButtons
  | AllButtons
);

// eslint-disable-next-line react/jsx-props-no-spreading
const Dialog = (props: DialogProps) => <BaseDialog {...props} isResponsive />;

export default Dialog;
