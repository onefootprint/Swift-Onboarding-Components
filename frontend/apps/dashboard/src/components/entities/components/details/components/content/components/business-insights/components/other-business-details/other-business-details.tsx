import { BusinessDetails } from '@onefootprint/types';
import { Badge, Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useOtherDetailText from '../../hooks/use-other-detail-text';
import { BusinessDetail } from '../../types';
import LineItem from '../line-item';

type OtherBusinessDetailsProps = {
  data: BusinessDetails;
};

const OtherBusinessDetails = ({ data }: OtherBusinessDetailsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights',
  });
  const detailT = useOtherDetailText();

  const renderBadge = (isVerified: boolean) => {
    return (
      <Badge variant={isVerified ? 'success' : 'error'}>
        {isVerified ? t('tags.verified') : t('tags.not-verified')}
      </Badge>
    );
  };

  return (
    <Stack direction="column" gap={4}>
      <LineItem leftText={detailT(BusinessDetail.formationDate)} rightText={data.formationDate} />
      <LineItem leftText={detailT(BusinessDetail.formationState)} rightText={data.formationState} />
      <LineItem
        leftText={detailT(BusinessDetail.tin)}
        badge={renderBadge(!!data.tin.verified)}
        rightText={data.tin.tin}
      />
      <LineItem leftText={detailT(BusinessDetail.entityType)} rightText={data.entityType} />
      {data.phoneNumbers.map(phoneNumber => (
        <LineItem
          key={phoneNumber.phone}
          leftText={detailT(BusinessDetail.phoneNumber)}
          badge={renderBadge(!!phoneNumber.verified)}
          rightText={phoneNumber.phone}
        />
      ))}
      <LineItem
        leftText={detailT(BusinessDetail.website)}
        badge={renderBadge(!!data.website.verified)}
        rightText={data.website.url}
      />
    </Stack>
  );
};

export default OtherBusinessDetails;
