import { IcoPlusSmall16 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import React from 'react';

import type { PillProps } from '../pill';
import Pill from '../pill';

const AddPill = ({ children, onClick }: PillProps) => (
  <StyledPill onClick={onClick} type="button">
    <IcoPlusSmall16 color="tertiary" />
    {children}
  </StyledPill>
);

const StyledPill = styled(Pill)`
  border-style: dashed;
`;

export default AddPill;
