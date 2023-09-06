import { useTranslation } from '@onefootprint/hooks';
import { IcoQuoteLeft16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { Annotation } from '@onefootprint/types';
import { Toggle } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';

import TruncatedText from '@/entities/components/details/components/truncated-text';
import useCurrentEntityUpdateAnnotation from '@/entity/hooks/use-current-entity-update-annotation';

type AnnotationNoteProps = {
  annotation: Annotation;
};

const DEFAULT_TEXT_VIEW_HEIGHT = 60;

const AnnotationNote = ({ annotation }: AnnotationNoteProps) => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.onboarding-decision-event',
  );
  const [isNotePinned, setIsNotePinned] = useState(!!annotation?.isPinned);
  const updateMutation = useCurrentEntityUpdateAnnotation();

  useEffect(() => {
    setIsNotePinned(annotation.isPinned);
  }, [annotation?.isPinned]);

  const handlePinNoteChange = () => {
    const newIsNotePinned = !isNotePinned;
    updateMutation.mutate({
      isPinned: newIsNotePinned,
      annotationId: annotation?.id,
    });
    setIsNotePinned(newIsNotePinned);
  };

  return annotation ? (
    <NoteContainer>
      <QuoteIconContainer>
        <IcoQuoteLeft16 />
      </QuoteIconContainer>
      <TruncatedText
        text={annotation?.note}
        maxTextViewHeight={DEFAULT_TEXT_VIEW_HEIGHT}
        textFontVariant="body-3"
        textSxStyle={{
          marginTop: 5,
          marginRight: 4,
          marginBottom: 5,
          marginLeft: 9,
          color: 'secondary',
        }}
      />
      <PinButtonContainer>
        <Toggle
          checked={isNotePinned}
          onChange={handlePinNoteChange}
          labelPlacement="right"
          size="compact"
          label={t('org-overwrite.drawer.pin-note')}
        />
      </PinButtonContainer>
    </NoteContainer>
  ) : null;
};

const NoteContainer = styled.div`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: ${theme.spacing[0]};
    margin-left: calc(-1 * ${theme.spacing[5]});

    &::before {
      content: ' ';
      position: absolute;
      width: ${theme.spacing[0]};
      height: ${theme.spacing[0]};
      left: ${theme.spacing[5]};
      right: auto;
      bottom: auto;
      top: calc(-1 * ${theme.spacing[5]});
      border: ${theme.spacing[3]} solid;
      border-color: transparent transparent ${theme.borderColor.tertiary}
        transparent;
    }

    &::after {
      content: ' ';
      position: absolute;
      width: ${theme.spacing[0]};
      height: ${theme.spacing[0]};
      left: ${theme.spacing[5]};
      right: auto;
      bottom: auto;
      top: calc((-1 * ${theme.spacing[5]}) + 1px);
      border: ${theme.spacing[3]} solid;
      border-color: transparent transparent ${theme.backgroundColor.primary}
        transparent;
    }
  `};
`;

const PinButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
    width: 100%;
    height: 36px;
    background: ${theme.backgroundColor.secondary};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.none} ${theme.borderRadius.none}
      ${theme.borderRadius.default} ${theme.borderRadius.default};
  `}
`;

const QuoteIconContainer = styled.span`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[5]};
    top: ${theme.spacing[5]};
  `}
`;

export default AnnotationNote;
