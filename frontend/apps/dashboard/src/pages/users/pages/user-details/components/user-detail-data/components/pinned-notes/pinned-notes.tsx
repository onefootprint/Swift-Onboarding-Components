import React from 'react';
import styled, { css } from 'styled-components';

import { parseAnnotationNote } from '../../utils/annotation-note-utils';
import PinnedNote from './components/pinned-note';
import useGetPinnedAnnotations from './hooks/use-get-pinned-annotations';

const PinnedNotes = () => {
  const pinnedAnotationsQuery = useGetPinnedAnnotations();

  return (
    <Container>
      {pinnedAnotationsQuery?.data?.map(annotation => {
        const { reason, note } = parseAnnotationNote(annotation.note);
        return <PinnedNote reason={reason} note={note} key={annotation.id} />;
      })}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

export default PinnedNotes;
