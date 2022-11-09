import { useTranslation } from '@onefootprint/hooks';
import {
  DecisionSourceKind,
  OnboardingDecisionEventData,
  VerificationStatus,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import createStringList from '../../utils/create-string-list';
import createTagList from '../../utils/create-tag-list';
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
    source,
    vendors,
    verificationStatus,
    obConfiguration: { mustCollectData, mustCollectIdentityDocument },
  } = data;
  const status = t(`verification-status.${verificationStatus}`);

  if (source.kind !== DecisionSourceKind.footprint) {
    return null;
  }

  if (verificationStatus === VerificationStatus.verified) {
    const vendorsList = createStringList(
      vendors?.map(vendor => allT(`vendors.${vendor}`)) ?? [],
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
              {status}
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

  if (
    verificationStatus === VerificationStatus.needsIdDocument ||
    verificationStatus === VerificationStatus.manualReview ||
    verificationStatus === VerificationStatus.informationRequired
  ) {
    return (
      <EventBodyEntry
        content={status}
        testID="onboarding-decision-event-body"
      />
    );
  }

  return null;
};

export default OnboardingDecisionEventBody;
