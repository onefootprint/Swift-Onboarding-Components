import { Stack } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import type { DataToCollectMeta } from '@/playbooks/utils/machine/types';

import Form from './components/editing';
import Preview from './components/preview';

type PersonProps = {
  meta: DataToCollectMeta;
};

const Person = ({ meta }: PersonProps) => {
  const [showForm, setShowForm] = useState(false);

  const stopEditing = () => setShowForm(false);

  const startEditing = () => setShowForm(true);

  return (
    <Container>
      {showForm ? <Form onStopEditing={stopEditing} /> : <Preview onStartEditing={startEditing} meta={meta} />}
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderColor.tertiary} ${theme.borderWidth[1]} solid;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
  `}
`;

export default Person;
