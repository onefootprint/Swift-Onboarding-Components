import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Subsection from '../../../../../subsection';
import type {
  FormattedDetails,
  FormattedName,
  FormattedRegistration,
} from '../../../../onboarding-business-insight.types';
import RegistrationDetails from '../registration-details';
import BusinessNameList from './components/business-name-list';

type BusinessDetailsProps = {
  names: FormattedName[];
  details: FormattedDetails;
  registrations: FormattedRegistration[];
};

const BusinessDetails = ({ names, details, registrations }: BusinessDetailsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.business-details' });
  const [openRegistrationId, setOpenRegistrationId] = useState<string | undefined>(undefined);
  const openRegistration = registrations.find(r => r.id === openRegistrationId);

  const handleOpen = (registrationId: string) => {
    setOpenRegistrationId(registrationId);
  };

  const handleClose = () => {
    setOpenRegistrationId(undefined);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <Subsection title={t('name.title')}>
          <BusinessNameList data={names} onOpen={handleOpen} />
        </Subsection>
        <Subsection title={t('details.title')} hasDivider>
          <span>{details?.formationDate}</span>
        </Subsection>
      </div>
      {!!openRegistration && <RegistrationDetails registration={openRegistration} onClose={handleClose} />}
    </>
  );
};

export default BusinessDetails;
