import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import Editing from './components/editing';
import Preview from './components/preview';

const BusinessInformation = () => {
  const [editing, setEditing] = useState(false);

  const stopEditing = () => setEditing(false);
  const startEditing = () => setEditing(true);

  return (
    <Container>
      {editing ? <Editing onStopEditing={stopEditing} /> : <Preview onStartEditing={startEditing} />}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
    gap: ${theme.spacing[5]};
    border: ${theme.borderColor.tertiary} ${theme.borderWidth[1]} solid;
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default BusinessInformation;
