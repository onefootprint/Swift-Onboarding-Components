import { Box, Divider, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { DataToCollectMeta, ResidencyFormData } from '@/playbooks/utils/machine/types';
import { CountryRestriction } from '@/playbooks/utils/machine/types';
import { isKyb } from 'src/pages/playbooks/utils/kind';

import DataCollection from '../../../data-collection';
import usePersonValues from '../../hooks/use-person-values';
import CountryList from './components/country-list';

type PreviewProps = {
  meta: DataToCollectMeta;
};

const Preview = ({ meta: { residency, kind } }: PreviewProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.person.preview',
  });
  const { meta } = usePersonValues();
  const isInternationalOnly = residency?.allowInternationalResidents && !residency.allowUsResidents;
  const isKybAndSkipBOCollection = isKyb(kind) && !meta.collectsBOInfo;
  const allowUsTerritoryResidents = residency?.allowUsTerritories;

  return isKybAndSkipBOCollection ? (
    <Stack flexDirection="column" gap={6}>
      <Stack flexDirection="column" gap={8}>
        <DataCollection.Item label={t('collect-bo-info')} checked={false} />
      </Stack>
    </Stack>
  ) : (
    <Stack flexDirection="column" gap={6}>
      <Stack flexDirection="column" gap={8}>
        {isKyb(kind) && <DataCollection.Item label={t('collect-bo-info')} checked={meta.collectsBOInfo} />}
        <DataCollection.Group title={t('basic-information.title')}>
          <DataCollection.Item label={t('basic-information.name')} checked />
          <DataCollection.Item label={t('basic-information.email')} checked={meta.hasEmail} />
          <DataCollection.Item label={t('basic-information.phone')} checked={meta.hasPhoneNumber} />
          <DataCollection.Item label={t('basic-information.dob')} checked={meta.hasDob} />
          <DataCollection.Item label={t('basic-information.address')} checked={meta.hasAddress} />
        </DataCollection.Group>
        {isInternationalOnly ? <InternationalResidents residency={residency} /> : <UsResidents />}
        {allowUsTerritoryResidents && <UsTerritoriesNote />}
      </Stack>
    </Stack>
  );
};

const SsnDetails = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.person.preview',
  });
  const { meta } = usePersonValues();

  if (!meta.collectsSsn) return null;

  const optionalText = meta.hasSsnOptional ? ` (${t('us-residents.ssn.optional')})` : '';
  const ssnKindText = meta.isSsn9 ? t('us-residents.ssn.full') : t('us-residents.ssn.last-4');
  return (
    <Text variant="body-3">
      {ssnKindText}
      {optionalText}
    </Text>
  );
};

const UsResidents = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.person.preview',
  });
  const { meta } = usePersonValues();

  return (
    <>
      <DataCollection.Group title={t('us-residents.title')}>
        <DataCollection.Item label={t('us-residents.ssn.label')} checked={meta.collectsSsn ? undefined : false}>
          <SsnDetails />
        </DataCollection.Item>
        <DataCollection.Item label={t('us-residents.itin')} checked={meta.hasUsTaxIdAcceptable} />
        <DataCollection.Item label={t('us-residents.legal-status')} checked={meta.hasUsLegalStatus} />
      </DataCollection.Group>
      <DataCollection.Group title={t('non-us-residents.title')}>
        <DataCollection.EmptyItem>{t('non-us-residents.empty')}</DataCollection.EmptyItem>
      </DataCollection.Group>
    </>
  );
};

const InternationalResidents = ({ residency }: { residency: ResidencyFormData }) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.person.preview',
  });
  const hasAllInternationalCountries = residency?.restrictCountries === CountryRestriction.all;

  return (
    <>
      <DataCollection.Group title={t('us-residents.title')}>
        <DataCollection.EmptyItem>{t('us-residents.empty')}</DataCollection.EmptyItem>
      </DataCollection.Group>
      <DataCollection.Group title={t('non-us-residents.title')}>
        {hasAllInternationalCountries ? (
          <DataCollection.EmptyItem>{t('non-us-residents.all')}</DataCollection.EmptyItem>
        ) : (
          <DataCollection.Item label={t('non-us-residents.restrictions')}>
            <CountryList countries={residency?.countryList?.map(c => c.label) || []} />
          </DataCollection.Item>
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
