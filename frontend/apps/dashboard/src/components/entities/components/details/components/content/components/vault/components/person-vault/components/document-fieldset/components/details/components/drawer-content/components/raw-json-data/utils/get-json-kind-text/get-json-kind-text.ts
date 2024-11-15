import { RawJsonKinds } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const getJsonKindText = (kind: RawJsonKinds) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.documents.details.raw-json-data',
  });

  if (kind === RawJsonKinds.CurpValidationResponse) {
    return t('curp-validation-response');
  }
  if (kind === RawJsonKinds.SambaActivityHistoryResponse) {
    return t('samba-activity-history-response');
  }
};

export default getJsonKindText;
