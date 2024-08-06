import { InlineAlert } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const DecryptBanner = () => {
  const { t } = useTranslation('entity-documents', { keyPrefix: 'decrypt' });

  return <InlineAlert variant="warning">{t('info')}</InlineAlert>;
};

export default DecryptBanner;
