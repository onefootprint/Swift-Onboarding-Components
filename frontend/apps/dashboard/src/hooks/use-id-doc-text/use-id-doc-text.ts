import { SupportedIdDocTypes } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

/** @deprecated */
const useIdDocText = () => {
  const { t } = useTranslation('common', { keyPrefix: 'id_document' });
  const map: Record<SupportedIdDocTypes, string> = {
    [SupportedIdDocTypes.idCard]: t('id_card'),
    [SupportedIdDocTypes.driversLicense]: t('drivers_license'),
    [SupportedIdDocTypes.passport]: t('passport'),
    [SupportedIdDocTypes.visa]: t('visa'),
    [SupportedIdDocTypes.workPermit]: t('permit'),
    [SupportedIdDocTypes.residenceDocument]: t('residence_document'),
    [SupportedIdDocTypes.voterIdentification]: t('voter_identification'),
    [SupportedIdDocTypes.ssnCard]: t('ssn_card'),
    [SupportedIdDocTypes.lease]: t('lease'),
    [SupportedIdDocTypes.bankStatement]: t('bank_statement'),
    [SupportedIdDocTypes.utilityBill]: t('utility_bill'),
    [SupportedIdDocTypes.proofOfAddress]: t('proof_of_address'),
    [SupportedIdDocTypes.passportCard]: t('passport_card'),
    [SupportedIdDocTypes.custom]: t('passport_card'),
  };

  return (doc: SupportedIdDocTypes) => {
    return map[doc];
  };
};

export default useIdDocText;
