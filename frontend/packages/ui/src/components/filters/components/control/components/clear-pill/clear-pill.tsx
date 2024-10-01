import { IcoCloseSmall16 } from '@onefootprint/icons';

import type { PillProps } from '../pill';
import Pill from '../pill';

const ClearPill = ({ children, disabled, onClick }: PillProps) => (
  <Pill onClick={onClick} disabled={disabled} type="button">
    <IcoCloseSmall16 color={disabled ? 'quaternary' : 'tertiary'} />
    {children}
  </Pill>
);

export default ClearPill;
