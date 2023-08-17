import styled, { css } from '@onefootprint/styled';
import React, { useState } from 'react';

import Editing from './components/editing';
import Preview from './components/preview';

const PersonalInfoAndDocs = () => {
  const [editing, setEditing] = useState(true);

  return (
    <Container>
      {editing ? <Editing setEditing={setEditing} /> : <Preview />}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
    gap: ${theme.spacing[5]};
    border: ${theme.borderColor.tertiary} ${theme.borderWidth[1]} dashed;
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default PersonalInfoAndDocs;
