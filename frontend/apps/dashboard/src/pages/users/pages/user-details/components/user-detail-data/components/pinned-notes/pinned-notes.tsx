import { DecisionSourceKind } from '@onefootprint/types';
import React from 'react';
import useUserAnnotations from 'src/pages/users/pages/user-details/hooks/use-user-annotations';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import styled, { css } from 'styled-components';

import PinnedNote from './components/pinned-note';

const PinnedNotes = () => {
  const userId = useUserId();
  const { data } = useUserAnnotations(userId);

  return data?.length ? (
    <Container>
      {data.map(({ note, id, source }) => (
        <PinnedNote
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
