import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck16, IcoClose16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type {
  CollectedDataOption,
  OnboardingDecisionEventData,
} from '@onefootprint/types';
import { ActorKind, DecisionStatus } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
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
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.onboarding-decision-event',
  );
  const {
    annotation,
    decision: { source, status, obConfiguration: playbook },
  } = data;
  const statusStr = t(`decision-status.${status}`);

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

    // const collectedDataLabels = [
    //   ...mustCollectData.map(attr => allT(`cdo.${attr}`)),
    // TODO: Add collected id document types here
    // https://linear.app/footprint/issue/FP-1837/use-collected-id-document-types-in-audit-trail-right-now-we-default-to
    // ...collectedIdDocuments.map(idDoc => allT(`id-doc-type.${idDoc}`)),
    // ];

    // if (mustCollectIdentityDocument) {
    // TODO: Once we receive the dataIdentifier from the backend, we can use and we won't need to append the prefix anymore`
    // https://linear.app/footprint/issue/FP-3246/return-dataidentifier-for-timeline-iddoc-document-uploaded?noRedirect=1
    // collectedDataLabels.push(allT('di.id_document.id_card'));
    // }
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
