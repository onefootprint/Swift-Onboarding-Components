import type { IdDocImageTypes } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useUploadSideText = () => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.documents.details.side' });
  const sideLabelMapping = {
    front: t('front'),
    back: t('back'),
    selfie: t('selfie'),
  };
  return (side: IdDocImageTypes) => sideLabelMapping[side];
};

export default useUploadSideText;
