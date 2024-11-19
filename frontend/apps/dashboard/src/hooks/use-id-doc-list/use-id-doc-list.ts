import type { IdDocKind } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

const useIdDocList = () => {
  const { t } = useTranslation('common', { keyPrefix: 'id_document' });
  return (docs: IdDocKind[]) => {
    return [...docs].map(doc => t(doc)).sort((a, b) => a.localeCompare(b));
  };
};

export default useIdDocList;
