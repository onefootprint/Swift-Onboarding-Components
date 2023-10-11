import { useTranslation } from '@onefootprint/hooks';
import { IcoQuoteLeft16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Box, LinkButton, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

import TruncatedText from '@/entities/components/details/components/truncated-text';
import useCurrentEntityUpdateAnnotation from '@/entity/hooks/use-current-entity-update-annotation';

export type PinnedNoteProps = {
  note: string;
  author?: string;
  timestamp: string;
  noteId: string;
};

const DEFAULT_TEXT_VIEW_HEIGHT = 60;

const PinnedNote = ({ note, author, timestamp, noteId }: PinnedNoteProps) => {
  const { t } = useTranslation('pages.entity.pinned-notes');
  const updateMutation = useCurrentEntityUpdateAnnotation();

  const handleUnpinNote = (annotationId: string) => {
    updateMutation.mutate({
      isPinned: false,
      annotationId,
    });
  };

  return note.length > 0 ? (
    <Container>
      <Header>
        <TitleContainer>
          <Typography variant="label-3">
            {author && t('title-by-author', { author })}
          </Typography>
          <Typography variant="label-3" sx={{ marginLeft: 2 }}>
            &middot;
          </Typography>
          <LinkButton
            sx={{ marginLeft: 2 }}
            onClick={() => handleUnpinNote(noteId)}
            size="compact"
          >
            {t('unpin-button-text')}
          </LinkButton>
        </TitleContainer>
        <Typography variant="body-3" color="secondary">
          {timestamp}
        </Typography>
      </Header>
      <Stack>
        <Box as="span" width="fit-content">
          <IcoQuoteLeft16 />
        </Box>
        <TruncatedText
          text={note}
          maxTextViewHeight={DEFAULT_TEXT_VIEW_HEIGHT}
          textFontVariant="body-3"
          textSxStyle={{
            marginLeft: 4,
            color: 'secondary',
          }}
        />
      </Stack>
    </Container>
  ) : null;
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[5]};
    gap: ${theme.spacing[4]};
  `}
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default PinnedNote;
