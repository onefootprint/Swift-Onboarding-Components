import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import type { DataToCollectMeta } from '@/playbooks/utils/machine/types';

import Editing from './components/editing';
import Preview from './components/preview';

type PersonProps = {
  meta: DataToCollectMeta;
};

const Person = ({ meta }: PersonProps) => {
  const [editing, setEditing] = useState(false);

  const stopEditing = () => setEditing(false);

  const startEditing = () => setEditing(true);

  return (
    <Container>
      {editing ? (
        <Editing onStopEditing={stopEditing} meta={meta} />
      ) : (
        <Preview onStartEditing={startEditing} meta={meta} />
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderColor.tertiary} ${theme.borderWidth[1]} solid;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
  `}
`;

export default Person;
