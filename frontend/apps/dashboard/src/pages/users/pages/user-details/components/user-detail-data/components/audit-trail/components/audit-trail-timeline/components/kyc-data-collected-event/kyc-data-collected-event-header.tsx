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
};

const KycDataCollectedEventHeader = ({
  data,
}: KycDataCollectedEventHeaderProps) => {
  const { t, allT } = useTranslation(
    'pages.user-details.audit-trail.timeline.kyc-data-collected-event',
  );
  const { attributes } = data;
  const attributeLabels = attributes.map((attr: CollectedKycDataOption) =>
    allT(`collected-kyc-data-options.${attr}`),
  );

  return (
    <Typography variant="label-3" testID="kyc-data-collected-event-header">
      {t('title')}
      {createTagList(attributeLabels)}
    </Typography>
  );
};

export default KycDataCollectedEventHeader;
