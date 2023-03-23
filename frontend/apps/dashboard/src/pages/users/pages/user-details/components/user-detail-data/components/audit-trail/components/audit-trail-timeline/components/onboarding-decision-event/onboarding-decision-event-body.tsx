import { useTranslation } from '@onefootprint/hooks';
import {
  DecisionSourceKind,
  DecisionStatus,
  OnboardingDecisionEventData,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import createStringList from 'src/utils/create-string-list';
import createTagList from 'src/utils/create-tag-list';
import styled, { css } from 'styled-components';

import EventBodyEntry from '../event-body-entry';

type OnboardingDecisionEventBodyProps = {
  data: OnboardingDecisionEventData;
};

const OnboardingDecisionEventBody = ({
  data,
}: OnboardingDecisionEventBodyProps) => {
  const { t, allT } = useTranslation(
    'pages.user-details.audit-trail.timeline.onboarding-decision-event',
  );
  const {
    decision: {
      source,
      vendors,
      status,
      obConfiguration: { mustCollectData, mustCollectIdentityDocument },
    },
  } = data;
  const statusStr = t(`decision-status.${status}`);

  if (source.kind !== DecisionSourceKind.footprint) {
    return null;
  }

  if (status === DecisionStatus.pass) {
    const uniqueVendors = Array.from(new Set(vendors));
    const vendorsList = createStringList(
      uniqueVendors.map(vendor => allT(`vendor.${vendor}`)) ?? [],
    );

    const collectedDataLabels = [
      ...mustCollectData.map(attr => allT(`cdo.${attr}`)),
      // TODO: Add collected id document types here
      // https://linear.app/footprint/issue/FP-1837/use-collected-id-document-types-in-audit-trail-right-now-we-default-to
      // ...collectedIdDocuments.map(idDoc => allT(`id-doc-type.${idDoc}`)),
    ];

    if (mustCollectIdentityDocument) {
      // TODO: Once we receive the dataIdentifier from the backend, we can use and we won't need to append the prefix anymore`
      // https://linear.app/footprint/issue/FP-3246/return-dataidentifier-for-timeline-iddoc-document-uploaded?noRedirect=1
      collectedDataLabels.push(allT('di.id_document.id_card'));
    }

    return (
      <EventBodyEntry
        content={
          <Container>
            <Typography variant="body-3" as="span" sx={{ marginRight: 1 }}>
              {statusStr}
            </Typography>
            {createTagList(collectedDataLabels)}
            {vendors && (
              <>
                <Typography variant="body-3" as="span" sx={{ marginLeft: 1 }}>
                  {t('with')}
                </Typography>
                <Typography variant="body-3" as="span">
                  {vendorsList}
                </Typography>
              </>
            )}
          </Container>
        }
        testID="onboarding-decision-event-body"
      />
    );
  }

  if (status === DecisionStatus.stepUpRequired) {
    return (
      <EventBodyEntry
        content={statusStr}
        testID="onboarding-decision-event-body"
      />
    );
  }

  return null;
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
