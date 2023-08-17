import styled, { css } from '@onefootprint/styled';
import React, { useState } from 'react';

import { Kind } from '../../../../../../utils/machine/types';
import Editing from './components/editing';
import Preview from './components/preview';

type PersonalInfoAndDocsProps = {
  kind: Kind;
};

const PersonalInfoAndDocs = ({ kind }: PersonalInfoAndDocsProps) => {
  const [editing, setEditing] = useState(false);

  const stopEditing = () => setEditing(false);
  const startEditing = () => setEditing(true);

  return (
    <Container>
      {editing ? (
        <Editing stopEditing={stopEditing} kind={kind} />
      ) : (
        <Preview startEditing={startEditing} kind={kind} />
      )}
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
