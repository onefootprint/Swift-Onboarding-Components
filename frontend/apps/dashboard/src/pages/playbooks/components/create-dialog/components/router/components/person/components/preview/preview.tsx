import { Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { DataToCollectMeta } from '@/playbooks/utils/machine/types';
import { CountryRestriction, OnboardingTemplate } from '@/playbooks/utils/machine/types';

import DataCollection from '../../../data-collection';
import CountryList from './components/country-list';
import Header from './components/header';

type PreviewProps = {
  onStartEditing: () => void;
  meta: DataToCollectMeta;
};

const Preview = ({ onStartEditing, meta }: PreviewProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.settings-person.preview',
  });
  const isInternationalOnly = meta.residency?.allowInternationalResidents && !meta.residency.allowUsResidents;
  const isFixedPlaybook =
    meta.onboardingTemplate === OnboardingTemplate.Alpaca || meta.onboardingTemplate === OnboardingTemplate.Apex;
  const canEdit = !isInternationalOnly && !isFixedPlaybook;

  return (
    <Stack flexDirection="column" gap={6}>
      <Header canEdit={canEdit} onStartEditing={onStartEditing} />
      <Stack flexDirection="column" gap={8}>
        <DataCollection.Group title={t('basic-information.title')}>
          <DataCollection.Item label={t('basic-information.name')} checked />
          <DataCollection.Item label={t('basic-information.email')} checked />
          <DataCollection.Item label={t('basic-information.phone')} checked />
          <DataCollection.Item label={t('basic-information.dob')} checked />
          <DataCollection.Item label={t('basic-information.address')} checked />
        </DataCollection.Group>
        {isInternationalOnly ? (
          <>
            <DataCollection.Group title={t('us-residents.title')}>
              <DataCollection.EmptyItem>{t('us-residents.empty')}</DataCollection.EmptyItem>
            </DataCollection.Group>
            <DataCollection.Group title={t('non-us-residents.title')}>
              {meta.residency?.restrictCountries === CountryRestriction.all ? (
                <DataCollection.EmptyItem>{t('non-us-residents.all')}</DataCollection.EmptyItem>
              ) : (
                <DataCollection.Item label={t('non-us-residents.restrictions')}>
                  <CountryList countries={meta.residency?.countryList?.map(c => c.label) || []} />
                </DataCollection.Item>
              )}
            </DataCollection.Group>
          </>
        ) : (
          <>
            <DataCollection.Group title={t('us-residents.title')}>
              <DataCollection.Item label={t('us-residents.ssn')} checked />
              <DataCollection.Item label={t('us-residents.legal-status')} checked />
            </DataCollection.Group>
            <DataCollection.Group title={t('non-us-residents.title')}>
              <DataCollection.EmptyItem>{t('non-us-residents.empty')}</DataCollection.EmptyItem>
            </DataCollection.Group>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default Preview;
