import { useTranslation } from '@onefootprint/hooks';
import {
  DecisionSourceKind,
  OnboardingDecisionEvent,
  VerificationStatus,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import createStringList from '../../utils/create-string-list';
import createTagList from '../../utils/create-tag-list';
import EventBodyEntry from '../event-body-entry';

type OnboardingDecisionEventBodyProps = {
  data: OnboardingDecisionEvent;
};

const OnboardingDecisionEventBody = ({
  data,
}: OnboardingDecisionEventBodyProps) => {
  const { t, allT } = useTranslation(
    'pages.user-details.audit-trail.timeline.onboarding-decision-event',
  );
  const { source, verificationStatus, mustCollectData, collectedIdDocuments } =
    data;
  const status = t(`verification-status.${verificationStatus}`);

  if (source.kind !== DecisionSourceKind.footprint) {
    return null;
  }

  if (verificationStatus === VerificationStatus.verified) {
    const vendors = source.vendors.map(vendor => allT(`vendors.${vendor}`));
    const collectedDataLabels = [
      ...mustCollectData.map(attr =>
        allT(`collected-kyc-data-options.${attr}`),
      ),
      ...collectedIdDocuments.map(idDoc => allT(`id-doc-type.${idDoc}`)),
    ];
    return (
      <EventBodyEntry
        content={
          <>
            <Typography variant="body-3" as="span">
              {status}
            </Typography>
            <Typography variant="body-3" as="span">
              {createTagList(collectedDataLabels)}
            </Typography>
            <Typography variant="body-3" as="span">
              {t('with')}
            </Typography>
            <Typography variant="body-3" as="span">
              {createStringList(vendors)}
            </Typography>
          </>
        }
      />
    );
  }

  if (
    verificationStatus === VerificationStatus.needsIdDocument ||
    verificationStatus === VerificationStatus.manualReview ||
    verificationStatus === VerificationStatus.informationRequired
  ) {
    return <EventBodyEntry content={status} />;
  }

  return null;
};

export default OnboardingDecisionEventBody;
