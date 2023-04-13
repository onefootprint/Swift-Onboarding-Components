import { useTranslation } from '@onefootprint/hooks';
import { IcoPin24 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type PinnedNoteProps = {
  note: string;
  author?: string;
};

const PinnedNote = ({ note, author }: PinnedNoteProps) => {
  const { t } = useTranslation('pages.entity.pinned-notes');

  return note.length > 0 ? (
    <Container>
      <TitleContainer>
        <IcoPin24 />
        <Typography variant="label-3" sx={{ marginLeft: 2 }}>
          {t('title')}
          {author && t('title-by-author', { author })}
        </Typography>
      </TitleContainer>
      <Typography variant="body-3" color="secondary">
        {note}
      </Typography>
    </Container>
  ) : null;
};

const Container = styled.div`
  ${({ theme }) => css`
    background-color: rgba(74, 36, 219, 0.06);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: ${theme.spacing[5]};
    gap: ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.default};
  `}
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

export default PinnedNote;
