import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import DataCollection from '../../../../../../data-collection';
import useMeta from '../../../hooks/use-meta';

const Preview = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.business.data.preview' });
  const { meta } = useMeta();

  return (
    <Stack flexDirection="column" gap={2}>
      <DataCollection.Group title={t('basic-info.title')}>
        <DataCollection.Item label={t('basic-info.name')} checked={meta.hasName} />
        <DataCollection.Item label={t('basic-info.address')} checked={meta.hasAddress} />
        <DataCollection.Item label={t('basic-info.tin')} checked={meta.hasTin} />
        <DataCollection.Item label={t('basic-info.type')} checked={meta.hasType} />
        <DataCollection.Item label={t('basic-info.website')} checked={meta.hasWebsite} />
        <DataCollection.Item label={t('basic-info.phone-number')} checked={meta.hasPhoneNumber} />
      </DataCollection.Group>
    </Stack>
  );
};

export default Preview;
