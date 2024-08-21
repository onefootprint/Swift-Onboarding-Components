import { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

type UseDocNameProps = {
  docType?: `${SupportedIdDocTypes}`;
  imageType?: `${IdDocImageTypes}`;
};

const useDocName = ({ docType, imageType }: UseDocNameProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'document-flow.id-doc.global' });

  const getDocName = () => {
    switch (docType) {
      case SupportedIdDocTypes.idCard:
        return t('doc-name.idCard');
      case SupportedIdDocTypes.driversLicense:
        return t('doc-name.driversLicense');
      case SupportedIdDocTypes.passport:
        return t('doc-name.passport');
      case SupportedIdDocTypes.visa:
        return t('doc-name.visa');
      case SupportedIdDocTypes.workPermit:
        return t('doc-name.workPermit');
      case SupportedIdDocTypes.residenceDocument:
        return t('doc-name.residenceDocument');
      case SupportedIdDocTypes.voterIdentification:
        return t('doc-name.voterIdentification');
      case SupportedIdDocTypes.passportCard:
        return t('doc-name.passportCard');
      default:
        return '';
    }
  };

  const getSideName = () => {
    if (imageType === IdDocImageTypes.selfie) {
      return t('side.selfie');
    }
    if (docType === SupportedIdDocTypes.passport || docType === SupportedIdDocTypes.visa) {
      return t('side.photo');
    }
    switch (imageType) {
      case IdDocImageTypes.front:
        return t('side.front');
      case IdDocImageTypes.back:
        return t('side.back');
      default:
        return '';
    }
  };

  return {
    getDocName,
    getSideName,
  };
};

export default useDocName;
