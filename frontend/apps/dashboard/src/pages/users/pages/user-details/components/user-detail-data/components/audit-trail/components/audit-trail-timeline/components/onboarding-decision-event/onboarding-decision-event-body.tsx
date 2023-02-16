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
    const vendorsList = Array.from(
      new Set(
        createStringList(
          vendors?.map(vendor => allT(`vendors.${vendor}`)) ?? [],
        ),
      ),
    );

    const collectedDataLabels = [
      ...mustCollectData.map(attr =>
        allT(`collected-kyc-data-options.${attr}`),
      ),
      // TODO: Add collected id document types here
      // https://linear.app/footprint/issue/FP-1837/use-collected-id-document-types-in-audit-trail-right-now-we-default-to
      // ...collectedIdDocuments.map(idDoc => allT(`id-doc-type.${idDoc}`)),
    ];

    if (mustCollectIdentityDocument) {
      collectedDataLabels.push(allT('id-doc-type.id_card'));
    }

    return (
      <EventBodyEntry
        content={
          <>
            <Typography variant="body-3" as="span">
              {statusStr}{' '}
            </Typography>
            <Typography variant="body-3" as="span">
              {createTagList(collectedDataLabels)}
            </Typography>
            {vendors && (
              <>
                <Typography variant="body-3" as="span">
                  {t('with')}
                </Typography>
                <Typography variant="body-3" as="span">
                  {vendorsList}
                </Typography>
              </>
            )}
          </>
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

export default OnboardingDecisionEventBody;
