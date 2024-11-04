import type { DocumentDI } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';
import getDataLabel from '../../utils/get-data-label';

const useDataLabelText = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.documents.details.ocr.labels',
  });

  return (key: DocumentDI | string, activeDocumentVersion: string) => {
    const field = getDataLabel(key, activeDocumentVersion);

    if (field === 'full_name') {
      return t('full-name');
    }
    if (field === 'dob') {
      return t('dob');
    }
    if (field === 'gender') {
      return t('gender');
    }
    if (field === 'full_address') {
      return t('full-address');
    }
    if (field === 'document_number') {
      return t('document-number');
    }
    if (field === 'issued_at') {
      return t('issued-at');
    }
    if (field === 'expires_at') {
      return t('expires-at');
    }
    if (field === 'issuing_country') {
      return t('issuing-country');
    }
    if (field === 'issuing_state') {
      return t('issuing-state');
    }
    if (field === 'ref_number') {
      return t('ref-number');
    }
    if (field === 'document_type') {
      return t('document-type');
    }
    if (field === 'nationality') {
      return t('nationality');
    }
    if (field === 'curp') {
      return t('curp');
    }
    return '-';
  };
};

export default useDataLabelText;
