import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedKycDataEventData,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import createTagList from 'src/utils/create-tag-list';

type KycDataCollectedEventHeaderProps = {
  data: CollectedKycDataEventData;
  isFromOtherOrg?: boolean;
};

const KycDataCollectedEventHeader = ({
  data,
  isFromOtherOrg,
}: KycDataCollectedEventHeaderProps) => {
  const { t, allT } = useTranslation(
    'pages.user-details.audit-trail.timeline.kyc-data-collected-event',
  );
  const { attributes } = data;
  const attributeLabels = attributes.map((attr: CollectedKycDataOption) =>
    allT(`collected-data-options.${attr}`),
  );

  return (
    <Typography
      variant="label-3"
      testID="kyc-data-collected-event-header"
      color={isFromOtherOrg ? 'tertiary' : 'primary'}
    >
      {isFromOtherOrg ? t('title-from-other-org') : t('title')}
      {createTagList(attributeLabels)}
    </Typography>
  );
};

export default KycDataCollectedEventHeader;
