import { DecisionSourceKind } from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';

import useGetPinnedAnnotations from '../../hooks/use-get-pinned-annotations';
import PinnedNote from './components/pinned-note';

const PinnedNotes = () => {
  const pinnedNotesQuery = useGetPinnedAnnotations();
  const { data } = pinnedNotesQuery;

  return data ? (
    <Container>
      {data.map(({ reason, note, id, source }) => (
        <PinnedNote
          reason={reason}
          note={note}
          key={id}
          author={
            source.kind === DecisionSourceKind.organization
              ? source.member
              : undefined
          }
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
