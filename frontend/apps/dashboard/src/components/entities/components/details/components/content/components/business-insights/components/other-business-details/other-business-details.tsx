import { BusinessDetail, BusinessDetails } from '@onefootprint/types';
import { Badge, Stack } from '@onefootprint/ui';
import isNull from 'lodash/isNull';
import { useTranslation } from 'react-i18next';
import useOtherDetailText from '../../hooks/use-other-detail-text';
import LineItem from '../line-item';

type OtherBusinessDetailsProps = {
  data: BusinessDetails;
};

const OtherBusinessDetails = ({ data }: OtherBusinessDetailsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights',
  });
  const detailT = useOtherDetailText();
  const { formationDate, formationState, tin, entityType, phoneNumbers, website } = data;

  const renderBadge = (isVerified: boolean | null) => {
    if (isNull(isVerified)) return null;
    return (
      <Badge variant={isVerified ? 'success' : 'error'}>
        {isVerified ? t('tags.verified') : t('tags.not-verified')}
      </Badge>
    );
  };

  return (
    <Stack direction="column" gap={4}>
      <LineItem leftText={detailT(BusinessDetail.formationDate)} rightText={formationDate} />
      <LineItem leftText={detailT(BusinessDetail.formationState)} rightText={formationState} />
      <LineItem leftText={detailT(BusinessDetail.tin)} badge={renderBadge(tin.verified)} rightText={tin.tin} />
      <LineItem leftText={detailT(BusinessDetail.entityType)} rightText={entityType} />
      {phoneNumbers.map(phoneNumber => (
        <LineItem
          key={phoneNumber.phone}
          leftText={detailT(BusinessDetail.phoneNumber)}
          badge={renderBadge(phoneNumber.verified)}
          rightText={phoneNumber.phone}
        />
      ))}
      <LineItem
        leftText={detailT(BusinessDetail.website)}
        badge={renderBadge(website.verified)}
        rightText={website.url}
      />
    </Stack>
  );
};

export default OtherBusinessDetails;
