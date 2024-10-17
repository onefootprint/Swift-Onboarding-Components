import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import DataCollection from '../../../../../../data-collection';
import useMeta from '../hooks/use-meta';

const Preview = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.person.preview' });
  const {
    collectsBo,
    hasEmail,
    hasPhoneNumber,
    hasDob,
    hasAddress,
    collectsSsn,
    hasUsLegalStatus,
    hasUsTaxIdAcceptable,
  } = useMeta();

  return collectsBo ? (
    <Stack flexDirection="column" gap={6}>
      <Stack flexDirection="column" gap={8}>
        <DataCollection.Group title={t('basic-information.title')}>
          <DataCollection.Item label={t('basic-information.name')} checked />
          <DataCollection.Item label={t('basic-information.email')} checked={hasEmail} />
          <DataCollection.Item label={t('basic-information.phone')} checked={hasPhoneNumber} />
          <DataCollection.Item label={t('basic-information.dob')} checked={hasDob} />
          <DataCollection.Item label={t('basic-information.address')} checked={hasAddress} />
        </DataCollection.Group>
        <DataCollection.Group title={t('us-residents.title')}>
          <DataCollection.Item label={t('us-residents.ssn.label')} checked={collectsSsn ? undefined : false}>
            <SsnDetails />
          </DataCollection.Item>
          <DataCollection.Item label={t('us-residents.itin')} checked={hasUsTaxIdAcceptable} />
          <DataCollection.Item label={t('us-residents.legal-status')} checked={hasUsLegalStatus} />
        </DataCollection.Group>
        <DataCollection.Group title={t('non-us-residents.title')}>
          <DataCollection.EmptyItem>{t('non-us-residents.empty')}</DataCollection.EmptyItem>
        </DataCollection.Group>
      </Stack>
    </Stack>
  ) : (
    <Stack flexDirection="column" gap={6}>
      <Stack flexDirection="column" gap={8}>
        <DataCollection.Item label={t('collect-bo-info')} checked={false} />
      </Stack>
    </Stack>
  );
};

const SsnDetails = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.person.preview' });
  const { collectsSsn, hasSsnOptional, isSsn9 } = useMeta();
  const optionalText = hasSsnOptional ? ` (${t('us-residents.ssn.optional')})` : '';
  const ssnKindText = isSsn9 ? t('us-residents.ssn.full') : t('us-residents.ssn.last-4');

  return collectsSsn ? (
    <Text variant="body-3">
      {ssnKindText}
      {optionalText}
    </Text>
  ) : null;
};

export default Preview;
