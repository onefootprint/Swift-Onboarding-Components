import { IcoQuoteLeft16 } from '@onefootprint/icons';
import { Box, LinkButton, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import TruncatedText from '@/entities/components/details/components/truncated-text';
import useCurrentEntityUpdateAnnotation from '@/entity/hooks/use-current-entity-update-annotation';
import PermissionGate from 'src/components/permission-gate';

export type PinnedNoteProps = {
  note: string;
  author?: string;
  timestamp: string;
  noteId: string;
};

const DEFAULT_TEXT_VIEW_HEIGHT = 60;

const PinnedNote = ({ note, author, timestamp, noteId }: PinnedNoteProps) => {
  const { t } = useTranslation('entity-details');
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
          <Text variant="label-3">{author && t('pinned-notes.title-by-author', { author })}</Text>
          <Text variant="label-3" marginLeft={2}>
            &middot;
          </Text>
          <PermissionGate scopeKind="manual_review" fallbackText={t('manual-review-not-allowed')}>
            <LinkButton $marginLeft={2} onClick={() => handleUnpinNote(noteId)}>
              {t('pinned-notes.unpin-button-text')}
            </LinkButton>
          </PermissionGate>
        </TitleContainer>
        <Text variant="body-3" color="secondary">
          {timestamp}
        </Text>
      </Header>
      <Stack>
        <Box tag="span" width="fit-content">
          <IcoQuoteLeft16 />
        </Box>
        <TruncatedText
          text={note}
          maxTextViewHeight={DEFAULT_TEXT_VIEW_HEIGHT}
          textFontVariant="body-3"
          textStyleProps={{
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
