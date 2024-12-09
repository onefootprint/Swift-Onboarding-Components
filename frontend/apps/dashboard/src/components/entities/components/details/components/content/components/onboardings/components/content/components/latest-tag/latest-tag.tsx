import { Tag } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const LatestTag = () => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.header' });

  return (
    <>
      <span className="text-primary text-label-2">⋅</span>
      <Tag className="flex-shrink-0">{t('latest')}</Tag>
    </>
  );
};

export default LatestTag;
