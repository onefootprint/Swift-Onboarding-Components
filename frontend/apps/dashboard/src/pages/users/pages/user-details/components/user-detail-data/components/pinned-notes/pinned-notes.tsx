import { DecisionSourceKind } from '@onefootprint/types';
import React from 'react';
import useUser from 'src/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import styled, { css } from 'styled-components';

import PinnedNote from './components/pinned-note';

const PinnedNotes = () => {
  const userId = useUserId();
  const {
    user: { annotations },
  } = useUser(userId);

  return annotations?.entries ? (
    <Container>
      {annotations?.entries.map(({ reason, note, id, source }) => (
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
