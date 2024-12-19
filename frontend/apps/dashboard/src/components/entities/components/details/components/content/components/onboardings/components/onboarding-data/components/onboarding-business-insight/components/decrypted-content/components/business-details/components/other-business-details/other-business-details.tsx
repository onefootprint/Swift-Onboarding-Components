import { Badge } from '@onefootprint/ui';
import isUndefined from 'lodash/isUndefined';
import { useTranslation } from 'react-i18next';
import type { FormattedDetails } from '../../../../../../onboarding-business-insight.types';
import LineItem from '../../../line-item';
import useOtherDetailText from './hooks/use-other-detail-text';

type OtherBusinessDetailsProps = {
  data: FormattedDetails;
};

const OtherBusinessDetails = ({
  data: { formationDate, formationState, tin, entityType, phoneNumbers, website },
}: OtherBusinessDetailsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings' });
  const detailT = useOtherDetailText();

  const renderBadge = (isVerified: boolean | undefined) => {
    if (isUndefined(isVerified)) return null;
    return (
      <Badge variant={isVerified ? 'success' : 'error'}>
        {isVerified ? t('business-shared.tags.verified') : t('business-shared.tags.not-verified')}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <LineItem label={detailT('formationDate')} value={formationDate} />
      <LineItem label={detailT('formationState')} value={formationState} />
      <LineItem label={detailT('tin')} badge={renderBadge(tin.verified)} value={tin.tin} />
      <LineItem label={detailT('entityType')} value={entityType} />
      {phoneNumbers.map(phoneNumber => (
        <LineItem
          key={phoneNumber.phone}
          label={detailT('phoneNumber')}
          badge={renderBadge(phoneNumber.verified)}
          value={phoneNumber.phone}
        />
      ))}
      <LineItem label={detailT('website')} badge={renderBadge(website.verified)} value={website.url} />
    </div>
  );
};

export default OtherBusinessDetails;
