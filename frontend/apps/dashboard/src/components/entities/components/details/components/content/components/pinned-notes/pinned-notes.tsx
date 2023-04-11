import { DecisionSourceKind } from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';

import useCurrentEntityAnnotations from '@/entity/hooks/use-current-entity-annotations';

import PinnedNote from './components/pinned-note';

const PinnedNotes = () => {
  const { data } = useCurrentEntityAnnotations();

  return data?.length ? (
    <Container>
      {data.map(({ note, id, source }) => (
        <PinnedNote
          author={
            source.kind === DecisionSourceKind.organization
              ? source.member
              : undefined
          }
          key={id}
          note={note}
        />
      ))}
    </Container>
  ) : null;
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[5]};
  `}
`;

export default PinnedNotes;
