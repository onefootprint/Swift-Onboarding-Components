import { useTranslation } from 'react-i18next';
import Subsection from '../../../../../subsection';
import type { FormattedDetails, FormattedName } from '../../../../onboarding-business-insight.types';
import BusinessNameList from './components/business-name-list';

type BusinessDetailsProps = {
  names: FormattedName[];
  details: FormattedDetails;
};

const BusinessDetails = ({ names, details }: BusinessDetailsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.business-details' });

  return (
    <div className="flex flex-col gap-6">
      <Subsection title={t('name.title')}>
        <BusinessNameList data={names} />
      </Subsection>
      <Subsection title={t('details.title')} hasDivider>
        <span>{details?.formationDate}</span>
      </Subsection>
    </div>
  );
};

export default BusinessDetails;
