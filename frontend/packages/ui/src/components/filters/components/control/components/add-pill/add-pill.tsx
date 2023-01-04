import { IcoPlusSmall16 } from '@onefootprint/icons';
import React from 'react';
import styled from 'styled-components';

import Pill, { PillProps } from '../pill';

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
