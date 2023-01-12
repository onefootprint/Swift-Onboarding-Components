import { useTranslation } from '@onefootprint/hooks';
import {
  DecisionSourceOrganization,
  DecisionStatus,
  OnboardingDecisionEventData,
} from '@onefootprint/types';
import { Drawer, LinkButton, Toggle, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import useRefetchUser from 'src/pages/users/pages/user-details/hooks/use-refetch-user';
import useUpdateAnnotation from 'src/pages/users/pages/user-details/hooks/use-update-annotation';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import styled, { css } from 'styled-components';

type OrgOverwriteDetailsProps = {
  data: OnboardingDecisionEventData;
  source: DecisionSourceOrganization;
};

const OrgOverwriteDetails = ({ data, source }: OrgOverwriteDetailsProps) => {
  const { t } = useTranslation(
    'pages.user-details.audit-trail.timeline.onboarding-decision-event',
  );
  const userId = useUserId();
  const refetchUser = useRefetchUser(userId);

  const {
    decision: { timestamp, status },
    annotation,
  } = data;
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isNotePinned, setIsNotePinned] = useState(!!annotation?.isPinned);
  const updateMutation = useUpdateAnnotation();

  if (!annotation) {
    return null;
  }

  const handlePinNoteChange = () => {
    const newIsNotePinned = !isNotePinned;
    updateMutation.mutate(
      {
        isPinned: newIsNotePinned,
        annotationId: annotation.id,
      },
      {
        onSuccess: () => {
          refetchUser();
        },
      },
    );
    setIsNotePinned(newIsNotePinned);
  };

  if (!annotation) {
    return null;
  }

  return (
    <>
      <LinkButton
        onClick={() => {
          setDrawerOpen(true);
        }}
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
          <ItemContainer>
            <Typography variant="label-3" color="tertiary">
              {t('org-overwrite.drawer.reviewer')}
            </Typography>
            <Typography variant="body-3">{source.member}</Typography>
          </ItemContainer>
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
            onChange={handlePinNoteChange}
            labelPlacement="right"
            label={t('org-overwrite.drawer.pin-note')}
          />
        </NoteContainer>
      </Drawer>
    </>
  );
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

export default OrgOverwriteDetails;
