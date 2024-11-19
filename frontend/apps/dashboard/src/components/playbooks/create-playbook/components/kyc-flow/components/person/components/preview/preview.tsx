import { getCountryNameFromCode } from '@onefootprint/global-constants';
import { Box, Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import DataCollection from '../../../../../data-collection';
import type { ResidencyFormData } from '../../../../../residency-step';
import useMeta from '../../hooks/use-meta';
import CountryList from './components/country-list';

type PreviewProps = {
  meta: {
    canEdit: boolean;
    residencyForm: ResidencyFormData;
  };
};

const Preview = ({ meta: { canEdit, residencyForm } }: PreviewProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.person.preview' });
  const { hasEmail, hasPhoneNumber, hasDob, hasAddress } = useMeta();

  return (
    <Stack flexDirection="column" gap={6}>
      <Stack flexDirection="column" gap={8}>
        <DataCollection.Group title={t('basic-information.title')}>
          <DataCollection.Item label={t('basic-information.name')} checked />
          <DataCollection.Item label={t('basic-information.email')} checked={hasEmail} />
          <DataCollection.Item label={t('basic-information.phone')} checked={hasPhoneNumber} />
          <DataCollection.Item label={t('basic-information.dob')} checked={hasDob} />
          <DataCollection.Item label={t('basic-information.address')} checked={hasAddress} />
        </DataCollection.Group>
        {residencyForm.residencyType === 'international' ? (
          <InternationalResidents
            meta={{
              canEdit,
              residencyForm,
            }}
          />
        ) : (
          <UsResidents />
        )}
        {residencyForm.allowUsTerritories && <UsTerritoriesNote />}
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

const UsResidents = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.person.preview' });
  const { collectsSsn, hasUsLegalStatus, hasUsTaxIdAcceptable } = useMeta();

  return (
    <>
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
    </>
  );
};

const InternationalResidents = ({ meta: { residencyForm } }: PreviewProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.person.preview' });

  return (
    <>
      <DataCollection.Group title={t('us-residents.title')}>
        <DataCollection.EmptyItem>{t('us-residents.empty')}</DataCollection.EmptyItem>
      </DataCollection.Group>
      <DataCollection.Group title={t('non-us-residents.title')}>
        {residencyForm.isCountryRestricted ? (
          <DataCollection.Item label={t('non-us-residents.restrictions')}>
            <CountryList countries={residencyForm.countryList.map(c => getCountryNameFromCode(c))} />
          </DataCollection.Item>
        ) : (
          <DataCollection.EmptyItem>{t('non-us-residents.all')}</DataCollection.EmptyItem>
        )}
      </DataCollection.Group>
    </>
  );
};

const UsTerritoriesNote = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.person.preview' });

  return (
    <footer>
      <Box marginBottom={5}>
        <Divider variant="secondary" />
      </Box>
      <Text variant="label-3" color="primary">
        {t('us-territories.label')}:{' '}
        <Text variant="label-3" color="tertiary" tag="span">
          {t('us-territories.content')}
        </Text>
      </Text>
    </footer>
  );
};

export default Preview;
