import type { Annotation } from '@onefootprint/types';
import { Toggle } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import TruncatedText from '@/entities/components/details/components/truncated-text';
import useCurrentEntityUpdateAnnotation from '@/entity/hooks/use-current-entity-update-annotation';
import PermissionGate from 'src/components/permission-gate';

type AnnotationNoteProps = {
  annotation: Annotation;
  hidePinToggle?: boolean;
};

const DEFAULT_TEXT_VIEW_HEIGHT = 90;

const AnnotationNote = ({ annotation, hidePinToggle }: AnnotationNoteProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.onboarding-decision-event.human-decision',
  });
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
    <>
      <TruncatedText
        text={`"${annotation.note}"`}
        maxTextViewHeight={DEFAULT_TEXT_VIEW_HEIGHT}
        textFontVariant="body-3"
        textStyleProps={{
          marginBottom: 4,
          paddingTop: 3,
          paddingRight: 4,
          paddingBottom: 3,
          paddingLeft: 4,
          backgroundColor: 'secondary',
          borderRadius: 'default',
          color: 'secondary',
        }}
      />
      {!hidePinToggle && (
        <PermissionGate scopeKind="manual_review" fallbackText="">
          <Toggle checked={isNotePinned} onChange={handlePinNoteChange} size="compact" label={t('pin-note')} />
        </PermissionGate>
      )}
    </>
  ) : null;
};

export default AnnotationNote;
