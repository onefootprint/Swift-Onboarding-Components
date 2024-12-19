import { useTranslation } from 'react-i18next';
import Subsection from '../../../../../subsection';
import type { FormattedDetails, FormattedName } from '../../../../onboarding-business-insight.types';
import BusinessNameList from './components/business-name-list';
import OtherBusinessDetails from './components/other-business-details';

type BusinessDetailsProps = {
  names: FormattedName[];
  details: FormattedDetails;
  onClick: (registrationId: string) => void;
};

const BusinessDetails = ({ names, details, onClick }: BusinessDetailsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.business-details' });

  return (
    <div className="flex flex-col gap-6">
      <Subsection title={t('name.title')}>
        <BusinessNameList data={names} onOpen={onClick} />
      </Subsection>
      <Subsection title={t('details.title')} hasDivider>
        <OtherBusinessDetails data={details} />
      </Subsection>
    </div>
  );
};

export default BusinessDetails;
