import React from 'react';
import styled, { css } from 'styled-components';

import useGetPinnedAnnotations from '../../hooks/use-get-pinned-annotations';
import PinnedNote from './components/pinned-note';

const PinnedNotes = () => {
  const pinnedNotesQuery = useGetPinnedAnnotations();
  const { data } = pinnedNotesQuery;

  return data ? (
    <Container>
      {data.map(({ reason, note, id }) => (
        <PinnedNote reason={reason} note={note} key={id} />
      ))}
    </Container>
  ) : null;
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

export default PinnedNotes;
