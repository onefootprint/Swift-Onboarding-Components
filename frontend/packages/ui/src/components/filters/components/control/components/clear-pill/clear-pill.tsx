import { IcoClose16 } from '@onefootprint/icons';

import type { PillProps } from '../pill';
import Pill from '../pill';

const ClearPill = ({ children, disabled, onClick }: PillProps) => (
  <Pill onClick={onClick} disabled={disabled} type="button">
    <IcoClose16 color={disabled ? 'quaternary' : 'tertiary'} />
    {children}
  </Pill>
);

export default ClearPill;
