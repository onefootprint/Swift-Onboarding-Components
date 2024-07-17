import { BusinessDetails } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import { BusinessDetail } from '../../types';
import DetailLine from './components/detail-line';

type OtherBusinessDetailsProps = {
  data: BusinessDetails;
};

const OtherBusinessDetails = ({ data }: OtherBusinessDetailsProps) => (
  <Stack direction="column" gap={4}>
    <DetailLine label={BusinessDetail.formationDate} value={data.formationDate} />
    <DetailLine label={BusinessDetail.formationState} value={data.formationState} />
    <DetailLine label={BusinessDetail.tin} value={data.tin} />
    <DetailLine label={BusinessDetail.entityType} value={data.entityType} />
    {data.phoneNumbers.map(phoneNumber => (
      <DetailLine key={phoneNumber.phone} label={BusinessDetail.phoneNumber} value={phoneNumber} />
    ))}
    <DetailLine label={BusinessDetail.website} value={data.website} />
  </Stack>
);

export default OtherBusinessDetails;
