import { useTranslation } from '@onefootprint/hooks';
import { IcoPin24 } from '@onefootprint/icons';
import { ActorKind } from '@onefootprint/types';
import { Divider, Typography } from '@onefootprint/ui';
import React, { Fragment } from 'react';
import styled, { css } from 'styled-components';

import useCurrentEntityAnnotations from '@/entity/hooks/use-current-entity-annotations';

import PinnedNote from './components/pinned-note';

const PinnedNotes = () => {
  const { data } = useCurrentEntityAnnotations();
  const { t } = useTranslation('pages.entity.pinned-notes');

  if (!data || data.length === 0) {
    return null;
  }
  return (
    <Container>
      <HeaderTitle>
        <IcoPin24 />
        <Typography variant="label-2">{t('title')}</Typography>
      </HeaderTitle>
      <NotesContainer>
        {data.map(({ note, id, source, timestamp }, i) => (
          <Fragment key={id}>
            <PinnedNote
              author={
                source.kind === ActorKind.organization
                  ? source.member
                  : t(`note-added-by-source.${source.kind}`)
              }
              key={id}
              note={note}
              timestamp={timestamp}
              noteId={id}
            />
            {i !== data.length - 1 && <StyledDivider />}
          </Fragment>
        ))}
      </NotesContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    gap: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[9]};
  `}
`;

const HeaderTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const NotesContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    width: calc(100% - ${theme.spacing[5]}*2);
    margin: auto;
  `}
`;

export default PinnedNotes;
