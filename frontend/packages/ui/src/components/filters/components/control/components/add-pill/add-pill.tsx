import { IcoPlusSmall16 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import React from 'react';

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
