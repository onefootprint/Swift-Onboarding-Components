import { useTranslation } from '@onefootprint/hooks';
import {
  DecisionSource,
  DecisionSourceKind,
  DecisionStatus,
  OnboardingDecisionEventData,
} from '@onefootprint/types';
import { Drawer, LinkButton, Toggle, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import useCurrentEntity from '@/business/hooks/use-current-entity';
import useUpdateAnnotation from '@/business/hooks/use-current-entity-update-annotation';

type AnnotationDetailsProps = {
  data: OnboardingDecisionEventData;
  source: DecisionSource;
};

const AnnotationDetails = ({
  data: {
    annotation,
    decision: { timestamp, status },
  },
  source,
}: AnnotationDetailsProps) => {
  const { t } = useTranslation(
    'pages.business.audit-trail.timeline.onboarding-decision-event',
  );
  const entityQuery = useCurrentEntity();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isNotePinned, setIsNotePinned] = useState(!!annotation?.isPinned);
  const updateMutation = useUpdateAnnotation();

  const handlePinNoteChange = (annotationId: string) => () => {
    const newIsNotePinned = !isNotePinned;
    updateMutation.mutate(
      {
        isPinned: newIsNotePinned,
        annotationId,
      },
      {
        onSuccess: () => {
          entityQuery.refetch();
        },
      },
    );
    setIsNotePinned(newIsNotePinned);
  };

  return annotation ? (
    <>
      <LinkButton
        sx={{ lineHeight: '20px' }}
        onClick={() => {
          setDrawerOpen(true);
        }}
        size="compact"
      >
        {t('org-overwrite.see-details')}
      </LinkButton>
      <Drawer
        open={isDrawerOpen}
        title={t('org-overwrite.drawer.title')}
        onClose={() => {
          setDrawerOpen(false);
        }}
      >
        <GridContainer>
          <ItemContainer>
            <Typography variant="label-3" color="tertiary">
              {t('org-overwrite.drawer.decision')}
            </Typography>
            <Typography
              variant="body-3"
              color={status === DecisionStatus.pass ? undefined : 'error'}
            >
              {t(`decision-status.${status}`)}
            </Typography>
          </ItemContainer>
          {source.kind === DecisionSourceKind.organization && (
            <ItemContainer>
              <Typography variant="label-3" color="tertiary">
                {t('org-overwrite.drawer.reviewer')}
              </Typography>
              <Typography variant="body-3">{source.member}</Typography>
            </ItemContainer>
          )}
          <ItemContainer>
            <Typography variant="label-3" color="tertiary">
              {t('org-overwrite.drawer.date')}
            </Typography>
            <Typography variant="body-3">
              {new Date(timestamp).toLocaleString('en-us', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Typography>
          </ItemContainer>
        </GridContainer>
        <NoteContainer>
          <Typography
            variant="label-3"
            color="tertiary"
            sx={{ marginBottom: 2 }}
          >
            {t('org-overwrite.drawer.note')}
          </Typography>
          <Typography variant="body-3" sx={{ marginBottom: 6 }}>
            {annotation.note}
          </Typography>
          <Toggle
            checked={isNotePinned}
            onChange={handlePinNoteChange(annotation.id)}
            labelPlacement="right"
            label={t('org-overwrite.drawer.pin-note')}
          />
        </NoteContainer>
      </Drawer>
    </>
  ) : null;
};

const GridContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[7]};
    grid-template-columns: repeat(2, 1fr);
  `}
`;

const ItemContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[2]};
  `}
`;

const NoteContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: baseline;
    margin-top: ${theme.spacing[7]};
  `}
`;

export default AnnotationDetails;
