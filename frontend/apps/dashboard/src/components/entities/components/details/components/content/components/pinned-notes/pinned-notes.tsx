import { useTranslation } from '@onefootprint/hooks';
import {
  IcoChevronLeft24,
  IcoChevronRight24,
  IcoPin24,
} from '@onefootprint/icons';
import { ActorKind } from '@onefootprint/types';
import { IconButton, SXStyles, Typography } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import useCurrentEntityAnnotations from '@/entity/hooks/use-current-entity-annotations';

import PinnedNote from './components/pinned-note';

enum ButtonType {
  LEFT = 'left',
  RIGHT = 'right',
}

const PinnedNotes = () => {
  const { data } = useCurrentEntityAnnotations();
  const [currNoteIndex, setCurrNoteIndex] = useState(0);
  const { t } = useTranslation('pages.entity.pinned-notes');

  const handleCarouselButtonClick = (buttonType: ButtonType) => {
    if (buttonType === ButtonType.LEFT) {
      setCurrNoteIndex(prev => prev - 1);
    } else if (buttonType === ButtonType.RIGHT) {
      setCurrNoteIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (data?.length && data.length <= currNoteIndex) {
      setCurrNoteIndex(data.length - 1);
    }
  }, [data, currNoteIndex]);

  if (!data?.length || data?.length <= currNoteIndex) {
    return null;
  }

  const { note, id, source, timestamp } = data[currNoteIndex];

  return (
    <Container>
      <PinHeader>
        <HeaderTitle>
          <IcoPin24 />
          <Typography variant="label-2">{t('title')}</Typography>
        </HeaderTitle>
        <CarouselButtons
          sx={{ visibility: data.length <= 1 ? 'hidden' : 'visible' }}
        >
          <IconButton
            aria-label={t('carousel-buttons.left-aria-label')}
            disabled={currNoteIndex === 0}
            onClick={() => handleCarouselButtonClick(ButtonType.LEFT)}
          >
            <IcoChevronLeft24 />
          </IconButton>
          <IconButton
            aria-label={t('carousel-buttons.right-aria-label')}
            disabled={currNoteIndex === data.length - 1}
            onClick={() => handleCarouselButtonClick(ButtonType.RIGHT)}
          >
            <IcoChevronRight24 />
          </IconButton>
        </CarouselButtons>
      </PinHeader>
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
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[5]};
  `}
`;

const PinHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[0]};
  `}
`;

const HeaderTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

const CarouselButtons = styled.div<{
  sx: SXStyles;
}>`
  ${({ sx }) => css`
    display: flex;
    align-items: center;
    ${sx}
  `}
`;

export default PinnedNotes;
