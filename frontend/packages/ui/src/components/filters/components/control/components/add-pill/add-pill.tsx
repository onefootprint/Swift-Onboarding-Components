import { IcoPlusSmall16 } from '@onefootprint/icons';
import styled from 'styled-components';

import type { PillProps } from '../pill';
import Pill from '../pill';

const AddPill = ({ children, onClick, disabled }: PillProps) => (
  <StyledPill onClick={onClick} type="button" disabled={disabled}>
    <IcoPlusSmall16 color={disabled ? 'quaternary' : 'tertiary'} />
    {children}
  </StyledPill>
);

const StyledPill = styled(Pill)`
  border-style: dashed;
`;

export default AddPill;
