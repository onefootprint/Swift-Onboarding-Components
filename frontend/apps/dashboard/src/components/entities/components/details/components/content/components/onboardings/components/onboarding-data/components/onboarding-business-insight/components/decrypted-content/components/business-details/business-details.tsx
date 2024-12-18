import type { BusinessDetail, InsightBusinessName } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import Subsection from '../../../../../subsection';

type BusinessDetailsProps = {
  names: InsightBusinessName[];
  details?: BusinessDetail;
};

const BusinessDetails = ({ names, details }: BusinessDetailsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.business-details' });

  return (
    <div className="flex flex-col gap-6">
      <Subsection title={t('name.title')} hasDivider>
        <span>{names.length}</span>
      </Subsection>
      <Subsection title={t('details.title')}>
        <span>{details?.formationDate}</span>
      </Subsection>
    </div>
  );
};

export default BusinessDetails;
