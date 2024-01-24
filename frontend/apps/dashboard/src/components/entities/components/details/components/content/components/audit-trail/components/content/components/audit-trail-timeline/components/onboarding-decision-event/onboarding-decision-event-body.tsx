import { IcoCheck16, IcoClose16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type {
  CollectedDataOption,
  OnboardingDecisionEventData,
} from '@onefootprint/types';
import { ActorKind, DecisionStatus } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CdoTagList from 'src/components/cdo-tag-list';

import AnnotationNote from '../annotation-note';
import EventBodyEntry from '../event-body-entry';
import PlaybookLink from '../playbook-link';
import Details from './components/details';

type OnboardingDecisionEventBodyProps = {
  data: OnboardingDecisionEventData;
};

const OnboardingDecisionEventBody = ({
  data,
}: OnboardingDecisionEventBodyProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.onboarding-decision-event',
  });
  const {
    annotation,
    decision: { source, status, obConfiguration: playbook },
  } = data;
  const statusStr = t(
    `decision-status.${status}` as ParseKeys<'common'>,
  ) as string;

  if (annotation && source.kind !== ActorKind.footprint) {
    return <AnnotationNote annotation={annotation} />;
  }

  let bodyContent;
  let iconComponent;
  if (status === DecisionStatus.pass) {
    iconComponent = IcoCheck16;
    const collectedDataOptions: CollectedDataOption[] = [
      ...playbook.mustCollectData,
    ];
    bodyContent = (
      <Container>
        <Typography variant="body-3" as="span" sx={{ marginRight: 1 }}>
          {statusStr}
        </Typography>
        <CdoTagList cdos={collectedDataOptions} singleDocument />
        <Details />
      </Container>
    );
  }

  if (status === DecisionStatus.stepUpRequired) {
    iconComponent = IcoClose16;
    bodyContent = statusStr;
  }

  if (status === DecisionStatus.fail) {
    iconComponent = IcoClose16;
  }

  return (
    <>
      {bodyContent && (
        <EventBodyEntry
          iconComponent={iconComponent}
          content={bodyContent}
          testID="onboarding-decision-event-body"
        />
      )}
      <EventBodyEntry
        iconComponent={iconComponent}
        testID="onboarding-decision-playbook-body"
        content={
          <Container>
            <Typography variant="body-3" as="span">
              {t('onboarded-onto')}
            </Typography>
            <PlaybookLink playbook={playbook} />
          </Container>
        }
      />
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};
  `}
`;

export default OnboardingDecisionEventBody;
